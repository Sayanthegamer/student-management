-- Migration: Add Row Level Security policies for students and fees tables
-- Description:
--   This migration enables RLS on both tables and grants institution-wide
--   access to all authenticated users. This is intentional for a single-tenant
--   model. Per-user isolation would require adding a `created_by UUID` column
--   and policies using `auth.uid() = created_by`.
--
-- Security note:
--   SECURITY DEFINER functions (e.g., sync_student_fee_batch) bypass RLS by design
--   and are controlled through GRANT EXECUTE; this is intentional.

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_students" ON public.students;
CREATE POLICY "authenticated_read_students"
  ON public.students
  FOR SELECT
  TO authenticated
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_insert_students" ON public.students;
CREATE POLICY "authenticated_insert_students"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_update_students" ON public.students;
CREATE POLICY "authenticated_update_students"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING  ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_delete_students" ON public.students;
CREATE POLICY "authenticated_delete_students"
  ON public.students
  FOR DELETE
  TO authenticated
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_read_fees" ON public.fees;
CREATE POLICY "authenticated_read_fees"
  ON public.fees
  FOR SELECT
  TO authenticated
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_insert_fees" ON public.fees;
CREATE POLICY "authenticated_insert_fees"
  ON public.fees
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_update_fees" ON public.fees;
CREATE POLICY "authenticated_update_fees"
  ON public.fees
  FOR UPDATE
  TO authenticated
  USING  ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "authenticated_delete_fees" ON public.fees;
CREATE POLICY "authenticated_delete_fees"
  ON public.fees
  FOR DELETE
  TO authenticated
  USING ( auth.role() = 'authenticated' );
