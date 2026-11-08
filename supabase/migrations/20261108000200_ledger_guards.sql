begin;

create function deqs_internal.reject_immutable_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'DEQS history is append-only' using errcode = '55000';
end
$$;

create trigger immutable_ledger before update or delete or truncate on deqs_data.ledger_entries
  for each statement execute function deqs_internal.reject_immutable_change();
create trigger immutable_corrections before update or delete or truncate on deqs_data.ledger_corrections
  for each statement execute function deqs_internal.reject_immutable_change();
create trigger immutable_opening_claims before update or delete or truncate on deqs_data.opening_claims
  for each statement execute function deqs_internal.reject_immutable_change();
create trigger immutable_profile_events before update or delete or truncate on deqs_data.customer_profile_events
  for each statement execute function deqs_internal.reject_immutable_change();
create trigger keep_command_keys before delete or truncate on deqs_data.financial_commands
  for each statement execute function deqs_internal.reject_immutable_change();
create trigger keep_opening_drafts before truncate on deqs_data.opening_drafts
  for each statement execute function deqs_internal.reject_immutable_change();

create function deqs_internal.guard_command() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.state = 'committed' then
      raise exception 'A command must be prepared before it commits' using errcode = '23514';
    end if;
    new.payload_fingerprint := encode(sha256(convert_to(jsonb_build_array(
      new.kind, new.payload_version, new.write_epoch, new.payload
    )::text, 'UTF8')), 'hex');
    return new;
  end if;

  if old.state <> 'prepared' or new.state not in ('committed', 'cancelled') or
    (to_jsonb(old) - array['state', 'terminal_at', 'receipt']) <>
    (to_jsonb(new) - array['state', 'terminal_at', 'receipt']) then
    raise exception 'Command identity, payload and terminal outcomes are immutable' using errcode = '55000';
  end if;
  return new;
end
$$;
create trigger command_state before insert or update on deqs_data.financial_commands
  for each row execute function deqs_internal.guard_command();

create function deqs_internal.guard_opening_draft() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op <> 'INSERT' and old.state = 'approved' then
    raise exception 'Approved opening drafts are immutable' using errcode = '55000';
  end if;
  if tg_op = 'DELETE' then return old; end if;

  if new.state = 'approved' then
    if tg_op = 'INSERT' then
      raise exception 'Save a draft before approving an opening' using errcode = '23514';
    end if;
    if (to_jsonb(new) - array['state', 'linked_customer_id', 'approval_command_key', 'updated_at']) <>
      (to_jsonb(old) - array['state', 'linked_customer_id', 'approval_command_key', 'updated_at']) or
      (old.linked_customer_id is not null and old.linked_customer_id is distinct from new.linked_customer_id) then
      raise exception 'Approval must use the reviewed draft revision' using errcode = '23514';
    end if;
    if not exists (select 1 from deqs_data.ledger_cutovers c
      where c.store_id = new.store_id and c.cutover_id = new.cutover_id and c.state = 'reconciling') then
      raise exception 'Opening approval requires an open reconciliation' using errcode = '23514';
    end if;
  elsif tg_op = 'UPDATE' then
    if (old.store_id, old.draft_id, old.cutover_id, old.paper_ref) is distinct from
      (new.store_id, new.draft_id, new.cutover_id, new.paper_ref) or new.revision <> old.revision + 1 then
      raise exception 'An edit must preserve the source and advance the draft revision' using errcode = '23514';
    end if;
  end if;
  return new;
end
$$;
create trigger opening_draft_state before insert or update or delete on deqs_data.opening_drafts
  for each row execute function deqs_internal.guard_opening_draft();

create function deqs_internal.guard_cutover() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.state = 'closed' or (tg_op = 'DELETE' and old.state <> 'draft') then
    raise exception 'Active and closed cutover history cannot be discarded' using errcode = '55000';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  if old.state = 'reconciling' and (new.state = 'draft' or
    (old.store_id, old.cutover_id, old.local_cutover_date, old.effective_at, old.paper_ledger_ref)
    is distinct from (new.store_id, new.cutover_id, new.local_cutover_date, new.effective_at, new.paper_ledger_ref)) then
    raise exception 'A cutover cannot change identity after reconciliation begins' using errcode = '55000';
  end if;
  if old.state = 'draft' and new.state = 'closed' then
    raise exception 'A cutover must be reconciled before closing' using errcode = '23514';
  end if;
  return new;
end
$$;
create trigger cutover_history before update or delete on deqs_data.ledger_cutovers
  for each row execute function deqs_internal.guard_cutover();
create trigger keep_cutovers before truncate on deqs_data.ledger_cutovers
  for each statement execute function deqs_internal.reject_immutable_change();

-- Evaluate the final transaction state, not an intermediate row insert.
create function deqs_internal.check_financial_group() returns trigger
language plpgsql set search_path = '' as $$
declare
  key uuid;
  cmd deqs_data.financial_commands%rowtype;
  first_entry deqs_data.ledger_entries%rowtype;
  second_entry deqs_data.ledger_entries%rowtype;
  target deqs_data.ledger_entries%rowtype;
  correction deqs_data.ledger_corrections%rowtype;
  claim deqs_data.opening_claims%rowtype;
  draft deqs_data.opening_drafts%rowtype;
  entry_ids jsonb;
  needs_transfer_claim boolean;
begin
  if tg_table_name = 'financial_commands' then
    key := new.idempotency_key;
  elsif tg_table_name = 'opening_drafts' then
    key := new.approval_command_key;
  else
    key := new.command_key;
  end if;
  select * into strict cmd from deqs_data.financial_commands
    where store_id = new.store_id and idempotency_key = key;
  select * into first_entry from deqs_data.ledger_entries
    where store_id = cmd.store_id and command_key = key and ordinal = 1;
  select * into second_entry from deqs_data.ledger_entries
    where store_id = cmd.store_id and command_key = key and ordinal = 2;
  select * into correction from deqs_data.ledger_corrections where store_id = cmd.store_id and command_key = key;
  select * into claim from deqs_data.opening_claims where store_id = cmd.store_id and command_key = key;
  select * into draft from deqs_data.opening_drafts where store_id = cmd.store_id and approval_command_key = key;

  if cmd.state <> 'committed' then
    if first_entry.entry_id is not null or second_entry.entry_id is not null or correction.correction_id is not null
      or claim.entry_id is not null or draft.draft_id is not null then
      raise exception 'Uncommitted command cannot have posted records' using errcode = '23514';
    end if;
    return null;
  end if;

  select jsonb_agg(entry_id order by ordinal) into entry_ids from deqs_data.ledger_entries
    where store_id = cmd.store_id and command_key = key;
  if first_entry.entry_id is null or cmd.receipt->>'idempotency_key' is distinct from key::text
    or cmd.receipt->'entry_ids' is distinct from entry_ids
    or first_entry.recorded_at not between cmd.prepared_at and cmd.terminal_at
    or (second_entry.entry_id is not null and second_entry.recorded_at <> first_entry.recorded_at) then
    raise exception 'Committed command requires its complete ledger receipt' using errcode = '23514';
  end if;

  if cmd.kind <> 'correction' then
    if first_entry.entry_role <> 'original' or first_entry.economic_kind <> cmd.kind
      or second_entry.entry_id is not null or correction.correction_id is not null then
      raise exception 'Ordinary command requires exactly one original entry' using errcode = '23514';
    end if;
    if cmd.kind = 'opening' then
      if draft.draft_id is null or claim.entry_id is null or claim.claim_kind <> 'source'
        or claim.entry_id <> first_entry.entry_id or claim.origin_draft_id <> draft.draft_id
        or claim.cutover_id <> draft.cutover_id or claim.paper_ref <> draft.paper_ref
        or claim.customer_id <> first_entry.customer_id or draft.linked_customer_id <> first_entry.customer_id
        or draft.proposed_fils <> first_entry.delta_fils
        or not exists (select 1 from deqs_data.ledger_cutovers c where c.store_id = cmd.store_id
          and c.cutover_id = claim.cutover_id and c.effective_at = first_entry.effective_at) then
        raise exception 'Opening requires an approved matching draft and source claim' using errcode = '23514';
      end if;
    elsif claim.entry_id is not null or draft.draft_id is not null then
      raise exception 'Only an opening can approve a draft' using errcode = '23514';
    end if;
    return null;
  end if;

  if correction.correction_id is null or draft.draft_id is not null or first_entry.entry_role <> 'reversal'
    or correction.reversal_entry_id <> first_entry.entry_id
    or correction.replacement_entry_id is distinct from second_entry.entry_id
    or correction.recorded_at <> first_entry.recorded_at then
    raise exception 'Correction requires a reversal and its complete audit links' using errcode = '23514';
  end if;
  select * into strict target from deqs_data.ledger_entries
    where store_id = cmd.store_id and entry_id = correction.target_entry_id;
  if target.entry_role = 'reversal' or target.ledger_seq >= first_entry.ledger_seq
    or first_entry.customer_id <> target.customer_id or first_entry.economic_kind <> target.economic_kind
    or first_entry.effective_at <> target.effective_at or first_entry.delta_fils <> -target.delta_fils
    or correction.previous_delta_fils <> target.delta_fils
    or not exists (select 1 from deqs_data.financial_commands original where original.store_id = target.store_id
      and original.idempotency_key = target.command_key and original.state = 'committed') then
    raise exception 'Reversal must exactly negate a prior committed entry' using errcode = '23514';
  end if;
  if second_entry.entry_id is not null and (second_entry.entry_role <> 'replacement'
    or second_entry.ledger_seq <= first_entry.ledger_seq or second_entry.economic_kind <> target.economic_kind
    or second_entry.effective_at <> target.effective_at or second_entry.delta_fils <> correction.corrected_delta_fils) then
    raise exception 'Replacement must match the audited correction' using errcode = '23514';
  end if;

  needs_transfer_claim := target.economic_kind = 'opening' and second_entry.entry_id is not null
    and second_entry.customer_id <> target.customer_id;
  if needs_transfer_claim then
    if claim.entry_id is null or claim.claim_kind <> 'transfer' or claim.entry_id <> second_entry.entry_id
      or claim.customer_id <> second_entry.customer_id or not exists (
        select 1 from deqs_data.opening_claims prior
        join deqs_data.ledger_cutovers c using (store_id, cutover_id)
        where prior.store_id = cmd.store_id and prior.cutover_id = claim.cutover_id
          and prior.customer_id = target.customer_id and c.effective_at = target.effective_at
          and prior.origin_entry_id = claim.origin_entry_id and prior.origin_draft_id = claim.origin_draft_id
      ) then
      raise exception 'Opening transfer must reserve the destination and retain the source' using errcode = '23514';
    end if;
  elsif claim.entry_id is not null then
    raise exception 'This correction cannot create an opening claim' using errcode = '23514';
  end if;
  return null;
end
$$;

create constraint trigger command_group_complete after insert or update on deqs_data.financial_commands
  deferrable initially deferred for each row execute function deqs_internal.check_financial_group();
create constraint trigger ledger_group_complete after insert on deqs_data.ledger_entries
  deferrable initially deferred for each row execute function deqs_internal.check_financial_group();
create constraint trigger correction_group_complete after insert on deqs_data.ledger_corrections
  deferrable initially deferred for each row execute function deqs_internal.check_financial_group();
create constraint trigger claim_group_complete after insert on deqs_data.opening_claims
  deferrable initially deferred for each row execute function deqs_internal.check_financial_group();
create constraint trigger approved_draft_group_complete after update on deqs_data.opening_drafts
  deferrable initially deferred for each row when (new.state = 'approved')
  execute function deqs_internal.check_financial_group();

revoke all on all functions in schema deqs_internal from public, anon, authenticated, service_role;
commit;
