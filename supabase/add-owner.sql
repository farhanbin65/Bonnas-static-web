-- FIRST create your login in Supabase: Authentication > Users > Add user > Create new user.
-- Set the password yourself and enable Auto Confirm User for this manually created account.
-- Replace the email below with that exact login email, then run this in SQL Editor.
-- Run the migration first. Keep this file free of passwords and secret keys.
do $$
declare login_id uuid;
begin
  select id into login_id from auth.users where lower(email) = lower('REPLACE_WITH_YOUR_LOGIN_EMAIL');
  if login_id is null then raise exception 'Create the login in Authentication > Users, and replace the email in this script first.'; end if;
  insert into public.business_members (user_id, role) values (login_id, 'owner')
  on conflict (user_id) do update set role = excluded.role;
end $$;
