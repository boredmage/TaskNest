-- Wire up todos + family invites.
--
-- Both `public.todos` and `public.family_invites` had RLS enabled but ZERO
-- policies, which means clients could neither read nor write them. This
-- migration adds the missing policies, a `category` column backing the task
-- category selector, and SECURITY DEFINER RPCs for the email-invite flow.

-- Helper: is the current user a member of the given family?
-- SECURITY DEFINER avoids RLS recursion when referenced from other policies.
create or replace function public.is_family_member(p_family_id uuid)
returns boolean
language sql
security definer
stable
set search_path to 'public'
as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family_id
      and user_id = auth.uid()
  );
$$;

-- todos: category column backing the UI category selector
alter table public.todos add column if not exists category text;

-- ---------------------------------------------------------------------------
-- todos RLS
-- ---------------------------------------------------------------------------
drop policy if exists "Members can read todos" on public.todos;
create policy "Members can read todos" on public.todos
  for select using (
    owner_id = auth.uid()
    or (family_id is not null and public.is_family_member(family_id))
  );

drop policy if exists "Members can create todos" on public.todos;
create policy "Members can create todos" on public.todos
  for insert with check (
    owner_id = auth.uid()
    and (
      scope = 'personal'
      or (scope = 'family' and family_id is not null and public.is_family_member(family_id))
    )
  );

drop policy if exists "Members can update todos" on public.todos;
create policy "Members can update todos" on public.todos
  for update using (
    owner_id = auth.uid()
    or (family_id is not null and public.is_family_member(family_id))
  ) with check (
    owner_id = auth.uid()
    or (family_id is not null and public.is_family_member(family_id))
  );

drop policy if exists "Owner can delete todos" on public.todos;
create policy "Owner can delete todos" on public.todos
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- family_invites RLS. Writes go through SECURITY DEFINER RPCs; clients only
-- need read access to the invitee's / family's invites.
-- ---------------------------------------------------------------------------
drop policy if exists "Invitee and family can read invites" on public.family_invites;
create policy "Invitee and family can read invites" on public.family_invites
  for select using (
    user_id = auth.uid()
    or public.is_family_member(family_id)
  );

-- ---------------------------------------------------------------------------
-- RPC: a family owner invites a member by email
-- ---------------------------------------------------------------------------
create or replace function public.invite_family_member(p_email text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_family_id uuid;
  v_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_family_id
  from families
  where owner_id = auth.uid() and is_archived = false
  limit 1;

  if v_family_id is null then
    raise exception 'Only a family owner can invite members';
  end if;

  select id into v_user_id
  from profiles
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    raise exception 'No TaskNest user found with that email';
  end if;

  if v_user_id = auth.uid() then
    raise exception 'You cannot invite yourself';
  end if;

  if exists (
    select 1 from family_members
    where family_id = v_family_id and user_id = v_user_id
  ) then
    raise exception 'This user is already a family member';
  end if;

  -- Clear any previous invite so a fresh INSERT (and its notify trigger) fires
  delete from family_invites
  where family_id = v_family_id and user_id = v_user_id;

  insert into family_invites (family_id, user_id, invited_by, status)
  values (v_family_id, v_user_id, auth.uid(), 'pending');
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: the invitee accepts or declines a pending invite
-- ---------------------------------------------------------------------------
create or replace function public.respond_to_family_invite(p_invite_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select user_id into v_user_id
  from family_invites
  where id = p_invite_id and status = 'pending';

  if v_user_id is null then
    raise exception 'Invite not found or already handled';
  end if;

  if v_user_id <> auth.uid() then
    raise exception 'This invite does not belong to you';
  end if;

  -- status change triggers membership insert (accept) + notifications
  update family_invites
  set status = case when p_accept then 'accepted'::invite_status else 'declined'::invite_status end,
      responded_at = now()
  where id = p_invite_id;

  -- mark the invitee's own notification as handled so the UI hides the buttons
  update notifications
  set data = coalesce(data, '{}'::jsonb)
             || jsonb_build_object('responded', true, 'accepted', p_accept),
      read_at = coalesce(read_at, now())
  where user_id = auth.uid()
    and type = 'family_invite_received'
    and (data ->> 'invite_id')::uuid = p_invite_id;
end;
$$;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.invite_family_member(text) to authenticated;
grant execute on function public.respond_to_family_invite(uuid, boolean) to authenticated;
