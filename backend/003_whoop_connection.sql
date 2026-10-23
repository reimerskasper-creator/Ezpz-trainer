begin;
create table public.whoop_oauth_states (
 state_hash text primary key check (state_hash ~ '^[a-f0-9]{64}$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 expires_at timestamptz not null
);
create index whoop_oauth_states_user_id_idx on public.whoop_oauth_states(user_id);
create table public.whoop_connections (
 user_id uuid primary key references auth.users(id) on delete cascade,
 encrypted_tokens jsonb not null,
 connected_at timestamptz not null default now()
);
alter table public.whoop_oauth_states enable row level security;
alter table public.whoop_connections enable row level security;
revoke all on public.whoop_oauth_states,public.whoop_connections from public,anon,authenticated;
grant select,insert,update,delete on public.whoop_oauth_states,public.whoop_connections to service_role;
comment on table public.whoop_connections is 'Server-only encrypted WHOOP OAuth credentials. No fitness measurements. Removed automatically with EZPZ account.';
commit;