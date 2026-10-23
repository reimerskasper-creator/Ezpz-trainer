alter table public.whoop_oauth_states add column return_platform text not null default 'web' check(return_platform in ('web','android'));
