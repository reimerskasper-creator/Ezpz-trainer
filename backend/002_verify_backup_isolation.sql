-- Run manually in Supabase SQL Editor. Everything below rolls back.
-- Test identities are temporary; this does not send emails or change real users.
begin;
insert into auth.users(id) values
 ('e2e00000-0000-4000-8000-000000000001'),
 ('e2e00000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub','e2e00000-0000-4000-8000-000000000001',true);
select * from public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,0);
do $$ begin
 if (select count(*) from public.fitness_backups) <> 1 then raise exception 'Own row read failed'; end if;
 begin
  perform public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,0);
  raise exception 'First-save collision was accepted';
 exception when serialization_failure then null; end;
 begin
  insert into public.fitness_backups(user_id,payload) values ('e2e00000-0000-4000-8000-000000000001','{}');
  raise exception 'Direct insert was accepted';
 exception when insufficient_privilege then null; end;
end $$;
select * from public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,1);
do $$ begin
 begin
  perform public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,1);
  raise exception 'Stale revision was accepted';
 exception when serialization_failure then null; end;
end $$;
select set_config('request.jwt.claim.sub','e2e00000-0000-4000-8000-000000000002',true);
do $$ begin
 if (select count(*) from public.fitness_backups) <> 0 then raise exception 'Other account row visible'; end if;
 begin
  perform public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,2);
  raise exception 'Other account backup was writable';
 exception when serialization_failure then null; end;
end $$;
select * from public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,0);
do $$ begin
 if (select count(*) from public.fitness_backups) <> 1 then raise exception 'Second account isolation failed'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin
  perform revision from public.fitness_backups;
  raise exception 'Anonymous read accepted';
 exception when insufficient_privilege then null; end;
 begin
  perform public.save_fitness_backup('{"profile":null,"logs":[],"weights":[]}'::jsonb,0);
  raise exception 'Anonymous write accepted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id='e2e00000-0000-4000-8000-000000000001';
do $$ begin
 if exists(select 1 from public.fitness_backups where user_id='e2e00000-0000-4000-8000-000000000001') then raise exception 'Account deletion did not remove backup'; end if;
end $$;
rollback;
select 'PASS: own reads, account isolation, anonymous denial, checked writes, revisions and deletion cascade; all temporary rows rolled back' as result;
