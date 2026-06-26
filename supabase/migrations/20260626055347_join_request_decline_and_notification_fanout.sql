-- Join-request decline + notification fan-out fixes.
--
-- 1. The parameterised approval RPC's notification update keyed on a
--    non-existent 'join_request_id' field and wrote {status} instead of the
--    {approved} flag the client reads, so the recipient's buttons never
--    cleared. Fix the key + flag and fan the update out to EVERY recipient's
--    notification (owner + admins).
-- 2. The previous decline path was a raw client DELETE on family_join_requests,
--    which is owner-only under RLS and silently no-ops (0 rows, no error) for
--    admins. Replace it with a SECURITY DEFINER RPC that authorises owner OR
--    admin and updates all recipients' notifications.

create or replace function public.handle_join_request_approval(p_join_request_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
DECLARE
  v_family_id UUID;
  v_user_id UUID;
BEGIN
  SELECT family_id, user_id
  INTO v_family_id, v_user_id
  FROM family_join_requests
  WHERE id = p_join_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Join request not found or already processed';
  END IF;

  UPDATE family_join_requests
  SET status = 'approved',
      reviewed_at = now(),
      reviewed_by = auth.uid()
  WHERE id = p_join_request_id;

  INSERT INTO family_members (family_id, user_id, role, joined_at)
  VALUES (v_family_id, v_user_id, 'member', now())
  ON CONFLICT (family_id, user_id) DO NOTHING;

  UPDATE notifications
  SET data = COALESCE(data, '{}'::jsonb) || jsonb_build_object('approved', true),
      read_at = COALESCE(read_at, now())
  WHERE type = 'join_request_received'
    AND (data ->> 'request_id')::uuid = p_join_request_id;
END;
$$;

create or replace function public.decline_join_request(p_join_request_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
DECLARE
  v_family_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT family_id
  INTO v_family_id
  FROM family_join_requests
  WHERE id = p_join_request_id
    AND status = 'pending';

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Join request not found or already processed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM family_members m
    WHERE m.family_id = v_family_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only a family owner or admin can decline join requests';
  END IF;

  DELETE FROM family_join_requests
  WHERE id = p_join_request_id;

  UPDATE notifications
  SET data = COALESCE(data, '{}'::jsonb) || jsonb_build_object('declined', true),
      read_at = COALESCE(read_at, now())
  WHERE type = 'join_request_received'
    AND (data ->> 'request_id')::uuid = p_join_request_id;
END;
$$;

grant execute on function public.handle_join_request_approval(uuid) to authenticated;
grant execute on function public.decline_join_request(uuid) to authenticated;
