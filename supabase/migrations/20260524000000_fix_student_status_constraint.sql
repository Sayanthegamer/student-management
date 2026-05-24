-- Migration: Fix student status constraint
-- Description: Updates the check_student_status_valid constraint to match the frontend application statuses

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS check_student_status_valid;

ALTER TABLE public.students
  ADD CONSTRAINT check_student_status_valid CHECK (status IN ('Confirmed', 'Provisional', 'Cancelled', 'Exited'));
