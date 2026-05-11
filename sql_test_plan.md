### RLS Security Verification Test Plan

You can run this script in the Supabase SQL Editor to verify that Multi-Tenant RLS isolation is functioning correctly.

```sql
-- 1. Create two test users in auth.users
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'userA@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'userB@test.com')
ON CONFLICT DO NOTHING;

-- 2. Insert test data directly (bypassing RLS as postgres superuser)
INSERT INTO public.students (id, user_id, name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Student A (Owned by User A)'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Student B (Owned by User B)')
ON CONFLICT DO NOTHING;

-- 3. Impersonate User A and verify visibility
SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
SET role authenticated;

SELECT id, name FROM public.students;
-- EXPECTED OUTCOME: Only 'Student A' is returned.

-- 4. Impersonate User B and verify visibility
SET request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
SET role authenticated;

SELECT id, name FROM public.students;
-- EXPECTED OUTCOME: Only 'Student B' is returned.

-- 5. Attempt unauthorized update
-- While acting as User B, try to update User A's record
UPDATE public.students SET name = 'Hacked' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- EXPECTED OUTCOME: UPDATE 0 (No rows affected, RLS blocked the operation)

-- 6. Cleanup (revert to postgres role and remove test data)
RESET ROLE;
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
```
