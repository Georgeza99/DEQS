-- Milestone A. Apply only to a new authorized DEQS environment.
-- Supabase owns the authenticated/anon roles and auth.uid()/auth.jwt().
begin;

create schema deqs_data;
create schema deqs_internal;
create schema deqs_api;
revoke all on schema deqs_data, deqs_internal, deqs_api from public, anon, authenticated;

-- This role can check ownership. It receives no ledger or table write grants.
create role deqs_context_reader nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
grant deqs_context_reader to current_user;

create table deqs_data.stores (
  store_id smallint primary key check (store_id = 1),
  owner_principal_id uuid not null unique,
  owner_auth_uid uuid unique,
  access_enabled boolean not null default false,
  writes_enabled boolean not null default false,
  write_epoch uuid not null default gen_random_uuid(),
  created_at timestamptz not null default clock_timestamp(),
  unique (store_id, owner_principal_id),
  check (not access_enabled or owner_auth_uid is not null),
  check (not writes_enabled or access_enabled)
);

create table deqs_data.customers (
  store_id smallint not null references deqs_data.stores (store_id),
  customer_id uuid not null default gen_random_uuid(),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 160),
  name_search text not null check (char_length(btrim(name_search)) between 1 and 160),
  phone_normalized text check (phone_normalized ~ '^\+[1-9][0-9]{1,14}$'),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  archived_at timestamptz,
  archived_by uuid,
  primary key (store_id, customer_id),
  foreign key (store_id, archived_by) references deqs_data.stores (store_id, owner_principal_id),
  check ((archived_at is null) = (archived_by is null)),
  check (updated_at >= created_at)
);
create index customers_by_name on deqs_data.customers (store_id, archived_at, name_search text_pattern_ops, customer_id);
create index customers_by_phone on deqs_data.customers (store_id, phone_normalized text_pattern_ops)
  where phone_normalized is not null;

create table deqs_data.customer_profile_events (
  store_id smallint not null,
  event_id uuid not null default gen_random_uuid(),
  customer_id uuid not null,
  event_kind text not null check (event_kind in ('created', 'edited', 'archived', 'restored')),
  actor_principal_id uuid not null,
  actor_auth_uid uuid not null,
  before_profile jsonb,
  after_profile jsonb not null check (jsonb_typeof(after_profile) = 'object'),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key (store_id, event_id),
  foreign key (store_id, customer_id) references deqs_data.customers (store_id, customer_id),
  foreign key (store_id, actor_principal_id) references deqs_data.stores (store_id, owner_principal_id),
  check ((event_kind = 'created' and before_profile is null) or
    (event_kind <> 'created' and before_profile is not null and jsonb_typeof(before_profile) = 'object'
      and before_profile <> after_profile))
);
create index profile_events_by_customer on deqs_data.customer_profile_events (store_id, customer_id, recorded_at, event_id);

create table deqs_data.ledger_cutovers (
  store_id smallint not null references deqs_data.stores (store_id),
  cutover_id uuid not null default gen_random_uuid(),
  local_cutover_date date not null,
  effective_at timestamptz not null,
  paper_ledger_ref text not null check (char_length(btrim(paper_ledger_ref)) between 1 and 160),
  expected_account_count integer not null check (expected_account_count >= 0),
  expected_opening_fils numeric not null check (expected_opening_fils >= 0 and
    expected_opening_fils < 'Infinity'::numeric and scale(expected_opening_fils) = 0),
  state text not null default 'draft' check (state in ('draft', 'reconciling', 'closed')),
  created_at timestamptz not null default clock_timestamp(),
  closed_at timestamptz,
  closed_by uuid,
  closure_snapshot jsonb,
  primary key (store_id, cutover_id),
  unique (store_id, local_cutover_date),
  foreign key (store_id, closed_by) references deqs_data.stores (store_id, owner_principal_id),
  check ((effective_at at time zone 'Asia/Amman')::date = local_cutover_date),
  check ((state <> 'closed' and closed_at is null and closed_by is null and closure_snapshot is null) or
    (state = 'closed' and closed_at is not null and closed_at >= created_at and closed_by is not null
      and closure_snapshot is not null and jsonb_typeof(closure_snapshot) = 'object'))
);
create unique index one_active_cutover on deqs_data.ledger_cutovers (store_id) where state in ('draft', 'reconciling');

create table deqs_data.financial_commands (
  store_id smallint not null,
  idempotency_key uuid not null,
  write_epoch uuid not null,
  kind text not null check (kind in ('opening', 'purchase', 'repayment', 'correction')),
  payload_version integer not null default 1 check (payload_version > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 16384),
  payload_fingerprint text not null check (payload_fingerprint ~ '^[a-f0-9]{64}$'),
  actor_principal_id uuid not null,
  actor_auth_uid uuid not null,
  state text not null default 'prepared' check (state in ('prepared', 'committed', 'cancelled')),
  prepared_at timestamptz not null default clock_timestamp(),
  terminal_at timestamptz,
  receipt jsonb,
  primary key (store_id, idempotency_key),
  foreign key (store_id, actor_principal_id) references deqs_data.stores (store_id, owner_principal_id),
  check ((state = 'prepared' and terminal_at is null and receipt is null) or
    (state in ('committed', 'cancelled') and terminal_at is not null and terminal_at >= prepared_at
      and receipt is not null and jsonb_typeof(receipt) = 'object'))
);
create index pending_commands on deqs_data.financial_commands (store_id, prepared_at) where state = 'prepared';
create index terminal_commands on deqs_data.financial_commands (store_id, terminal_at) where terminal_at is not null;

-- Save persists a reviewable draft. Only a separate approval can post an opening.
create table deqs_data.opening_drafts (
  store_id smallint not null,
  draft_id uuid not null default gen_random_uuid(),
  cutover_id uuid not null,
  paper_ref text not null check (paper_ref = btrim(paper_ref) and char_length(paper_ref) between 1 and 160),
  candidate_name text not null check (char_length(btrim(candidate_name)) between 1 and 160),
  candidate_phone text check (candidate_phone ~ '^\+[1-9][0-9]{1,14}$'),
  linked_customer_id uuid,
  proposed_fils bigint not null check (proposed_fils >= 0),
  revision bigint not null default 1 check (revision > 0),
  state text not null default 'draft' check (state in ('draft', 'approved')),
  approval_command_key uuid,
  saved_by uuid not null,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (store_id, draft_id),
  unique (store_id, cutover_id, paper_ref),
  unique (store_id, approval_command_key),
  foreign key (store_id, cutover_id) references deqs_data.ledger_cutovers (store_id, cutover_id),
  foreign key (store_id, linked_customer_id) references deqs_data.customers (store_id, customer_id),
  foreign key (store_id, approval_command_key) references deqs_data.financial_commands (store_id, idempotency_key),
  foreign key (store_id, saved_by) references deqs_data.stores (store_id, owner_principal_id),
  check ((state = 'draft' and approval_command_key is null) or
    (state = 'approved' and approval_command_key is not null and linked_customer_id is not null))
);

create table deqs_data.ledger_entries (
  store_id smallint not null,
  entry_id uuid not null default gen_random_uuid(),
  ledger_seq bigint generated always as identity unique,
  command_key uuid not null,
  ordinal smallint not null check (ordinal in (1, 2)),
  customer_id uuid not null,
  economic_kind text not null check (economic_kind in ('opening', 'purchase', 'repayment')),
  entry_role text not null check (entry_role in ('original', 'reversal', 'replacement')),
  -- Exclude the one BIGINT value with no representable negation.
  delta_fils bigint not null check (delta_fils >= -9223372036854775807),
  note text check (char_length(note) <= 1000),
  effective_at timestamptz not null,
  recorded_at timestamptz not null default clock_timestamp(),
  primary key (store_id, entry_id),
  unique (store_id, command_key, ordinal),
  foreign key (store_id, command_key) references deqs_data.financial_commands (store_id, idempotency_key),
  foreign key (store_id, customer_id) references deqs_data.customers (store_id, customer_id),
  check (effective_at <= recorded_at),
  check (entry_role = 'reversal' or
    (economic_kind = 'opening' and delta_fils >= 0) or
    (economic_kind = 'purchase' and delta_fils > 0) or
    (economic_kind = 'repayment' and delta_fils < 0))
);
create index ledger_customer_period on deqs_data.ledger_entries (store_id, customer_id, effective_at, ledger_seq);
create index ledger_store_period on deqs_data.ledger_entries (store_id, effective_at, ledger_seq);

create table deqs_data.opening_claims (
  store_id smallint not null,
  cutover_id uuid not null,
  customer_id uuid not null,
  command_key uuid not null,
  entry_id uuid not null,
  origin_entry_id uuid not null,
  origin_draft_id uuid not null,
  claim_kind text not null check (claim_kind in ('source', 'transfer')),
  paper_ref text,
  recorded_at timestamptz not null default clock_timestamp(),
  primary key (store_id, cutover_id, customer_id),
  unique (store_id, entry_id),
  unique (store_id, command_key),
  foreign key (store_id, cutover_id) references deqs_data.ledger_cutovers (store_id, cutover_id),
  foreign key (store_id, customer_id) references deqs_data.customers (store_id, customer_id),
  foreign key (store_id, command_key) references deqs_data.financial_commands (store_id, idempotency_key),
  foreign key (store_id, entry_id) references deqs_data.ledger_entries (store_id, entry_id),
  foreign key (store_id, origin_entry_id) references deqs_data.ledger_entries (store_id, entry_id),
  foreign key (store_id, origin_draft_id) references deqs_data.opening_drafts (store_id, draft_id),
  check ((claim_kind = 'source' and paper_ref is not null and entry_id = origin_entry_id) or
    (claim_kind = 'transfer' and paper_ref is null and entry_id <> origin_entry_id))
);
create unique index opening_source_once on deqs_data.opening_claims (store_id, cutover_id, paper_ref)
  where claim_kind = 'source';
create index opening_claim_lineage on deqs_data.opening_claims (store_id, cutover_id, origin_entry_id);

create table deqs_data.ledger_corrections (
  store_id smallint not null,
  correction_id uuid not null default gen_random_uuid(),
  command_key uuid not null,
  target_entry_id uuid not null,
  reversal_entry_id uuid not null,
  replacement_entry_id uuid,
  previous_delta_fils bigint not null,
  corrected_delta_fils bigint not null,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  recorded_at timestamptz not null default clock_timestamp(),
  primary key (store_id, correction_id),
  unique (store_id, command_key),
  unique (store_id, target_entry_id),
  unique (store_id, reversal_entry_id),
  unique (store_id, replacement_entry_id),
  foreign key (store_id, command_key) references deqs_data.financial_commands (store_id, idempotency_key),
  foreign key (store_id, target_entry_id) references deqs_data.ledger_entries (store_id, entry_id),
  foreign key (store_id, reversal_entry_id) references deqs_data.ledger_entries (store_id, entry_id),
  foreign key (store_id, replacement_entry_id) references deqs_data.ledger_entries (store_id, entry_id),
  check (target_entry_id <> reversal_entry_id),
  check (replacement_entry_id is null or replacement_entry_id not in (target_entry_id, reversal_entry_id)),
  check (replacement_entry_id is not null or corrected_delta_fils = 0)
);

-- Force RLS before any role can read or modify application records.
do $$
declare
  relation text;
begin
  foreach relation in array array['stores', 'customers', 'customer_profile_events', 'ledger_cutovers',
    'financial_commands', 'opening_drafts', 'ledger_entries', 'opening_claims', 'ledger_corrections'] loop
    execute format('alter table deqs_data.%I enable row level security', relation);
    execute format('alter table deqs_data.%I force row level security', relation);
  end loop;
end
$$;
revoke all on all tables in schema deqs_data from public, anon, authenticated;
revoke all on all sequences in schema deqs_data from public, anon, authenticated;
alter default privileges in schema deqs_data revoke all on tables from public, anon, authenticated;
alter default privileges in schema deqs_data revoke all on sequences from public, anon, authenticated;
commit;
