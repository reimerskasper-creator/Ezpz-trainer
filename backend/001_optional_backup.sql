-- Run in the owned Supabase project after review. No production service is configured yet.
begin;
create table if not exists public.fitness_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 2000000),
  updated_at timestamptz not null default now()
);
alter table public.fitness_backups enable row level security;
revoke all on public.fitness_backups from anon, authenticated;
grant select on public.fitness_backups to authenticated;
drop policy if exists fitness_backup_read_own on public.fitness_backups;
create policy fitness_backup_read_own on public.fitness_backups for select to authenticated using ((select auth.uid()) = user_id);
-- No client INSERT/UPDATE/DELETE privileges. Writes go through the checked revision function.
create or replace function public.save_fitness_backup(p_payload jsonb, p_expected_revision bigint)
returns table (revision bigint, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_revision bigint; v_updated timestamptz;
begin
  if v_user is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 then raise exception 'Invalid revision'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object'
    or jsonb_typeof(p_payload->'logs') is distinct from 'array'
    or jsonb_typeof(p_payload->'weights') is distinct from 'array'
    or not (p_payload ? 'profile')
    or jsonb_typeof(p_payload->'profile') not in ('object','null')
    or octet_length(p_payload::text) > 2000000 then raise exception 'Invalid backup'; end if;
  if p_expected_revision = 0 then
    insert into public.fitness_backups as b (user_id,payload) values (v_user,p_payload)
    on conflict (user_id) do nothing returning b.revision,b.updated_at into v_revision,v_updated;
  else
    update public.fitness_backups as b set payload=p_payload,revision=b.revision+1,updated_at=now()
    where b.user_id=v_user and b.revision=p_expected_revision
    returning b.revision,b.updated_at into v_revision,v_updated;
  end if;
  if v_revision is null then raise exception 'Backup changed on another device; review before replacing' using errcode='40001'; end if;
  return query select v_revision,v_updated;
end;
$$;
revoke all on function public.save_fitness_backup(jsonb,bigint) from public,anon;
grant execute on function public.save_fitness_backup(jsonb,bigint) to authenticated;
commit;
