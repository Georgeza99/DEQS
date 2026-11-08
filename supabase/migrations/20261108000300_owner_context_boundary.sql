begin;

-- No owner row or credentials are provisioned by this migration.
revoke all on schema deqs_data, deqs_internal, deqs_api from service_role;
revoke all on all tables in schema deqs_data from service_role;
revoke all on all sequences in schema deqs_data from service_role;

grant usage on schema deqs_data, auth to deqs_context_reader;
grant execute on function auth.uid(), auth.jwt() to deqs_context_reader;
grant select on deqs_data.stores to deqs_context_reader;
create policy owner_context_only on deqs_data.stores for select to deqs_context_reader
  using (access_enabled and owner_auth_uid = (select auth.uid()) and (select auth.jwt()->>'aal') = 'aal2');

create function deqs_internal.owner_context() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  context jsonb;
begin
  select jsonb_build_object('store_id', store_id, 'owner_principal_id', owner_principal_id,
    'write_epoch', write_epoch, 'writes_enabled', writes_enabled)
  into context
  from deqs_data.stores
  where access_enabled and owner_auth_uid = auth.uid() and auth.jwt()->>'aal' = 'aal2';

  if context is null then
    raise exception 'Owner access denied' using errcode = '42501';
  end if;
  return context;
end
$$;
grant usage, create on schema deqs_internal to deqs_context_reader;
alter function deqs_internal.owner_context() owner to deqs_context_reader;
revoke create on schema deqs_internal from deqs_context_reader;
revoke all on function deqs_internal.owner_context() from public, anon, authenticated, service_role;

create function deqs_api.owner_context() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select deqs_internal.owner_context();
$$;
revoke all on function deqs_api.owner_context() from public, anon, authenticated, service_role;
grant usage on schema deqs_api, deqs_internal to authenticated;
grant execute on function deqs_api.owner_context(), deqs_internal.owner_context() to authenticated;

commit;
