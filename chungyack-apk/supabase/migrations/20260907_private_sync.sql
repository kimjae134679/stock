-- ChungYack private cloud sync schema
-- Safe to keep in the public repository: contains no credentials or personal data.

begin;

create table if not exists public.chungyack_client_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.chungyack_assistant_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.chungyack_client_state enable row level security;
alter table public.chungyack_assistant_state enable row level security;

-- Re-create policies so the migration is repeatable.
drop policy if exists "client_select_own_state" on public.chungyack_client_state;
drop policy if exists "client_insert_own_state" on public.chungyack_client_state;
drop policy if exists "client_update_own_state" on public.chungyack_client_state;
drop policy if exists "client_delete_own_state" on public.chungyack_client_state;
drop policy if exists "assistant_select_own_state" on public.chungyack_assistant_state;

create policy "client_select_own_state"
on public.chungyack_client_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "client_insert_own_state"
on public.chungyack_client_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "client_update_own_state"
on public.chungyack_client_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "client_delete_own_state"
on public.chungyack_client_state
for delete
to authenticated
using (auth.uid() = user_id);

-- App may only read assistant-generated state for its own account.
-- Writes to this table are intentionally not granted to the app.
-- A trusted server/service-role/connected Supabase tool can write here.
create policy "assistant_select_own_state"
on public.chungyack_assistant_state
for select
to authenticated
using (auth.uid() = user_id);

revoke all on table public.chungyack_client_state from anon;
revoke all on table public.chungyack_assistant_state from anon;

grant select, insert, update, delete on table public.chungyack_client_state to authenticated;
grant select on table public.chungyack_assistant_state to authenticated;

commit;
