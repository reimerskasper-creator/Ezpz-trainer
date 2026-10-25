alter table public.whoop_connections add column sync_lock text, add column sync_lock_expires_at timestamptz;
