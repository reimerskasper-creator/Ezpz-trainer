begin;
create table public.whoop_pending_connections(
 completion_hash text primary key check(completion_hash ~ '^[a-f0-9]{64}$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 encrypted_tokens jsonb not null,
 expires_at timestamptz not null
);
create index whoop_pending_connections_user_id_idx on public.whoop_pending_connections(user_id);
alter table public.whoop_pending_connections enable row level security;
revoke all on public.whoop_pending_connections from public,anon,authenticated;
grant select,insert,update,delete on public.whoop_pending_connections to service_role;
commit;
