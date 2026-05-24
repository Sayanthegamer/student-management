-- Migration: Backend Security and Performance Optimizations
-- Description: Adds missing indexes for multi-tenant isolation and check constraints for data integrity.

-- 1. Performance: Add indexes for Foreign Keys
-- students table
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- fees table
CREATE INDEX IF NOT EXISTS idx_fees_user_id ON public.fees(user_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON public.fees(student_id);

-- Composite indexes for common UI filters
CREATE INDEX IF NOT EXISTS idx_students_user_id_class_section ON public.students(user_id, class, section);
CREATE INDEX IF NOT EXISTS idx_fees_user_id_date_desc ON public.fees(user_id, date DESC);

-- 2. Data Integrity: Add check constraints
-- fees table
ALTER TABLE public.fees 
  ADD CONSTRAINT check_fee_amount_positive CHECK (amount >= 0);

-- students table
ALTER TABLE public.students
  ADD CONSTRAINT check_student_status_valid CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Withdrawn'));

-- 3. Security: Ensure unique constraints per tenant
-- (admission_number should be unique for each user)
ALTER TABLE public.students
  ADD CONSTRAINT unique_admission_number_per_user UNIQUE (user_id, admission_number);

-- 4. Security: Hardening RPC Permissions
-- sync_student_fee_batch
REVOKE EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) TO authenticated;

-- delete_user_account (Already handled in previous migration, but reinforcing)
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- full_replace_import
REVOKE EXECUTE ON FUNCTION public.full_replace_import(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.full_replace_import(UUID, JSONB, JSONB) TO service_role;
