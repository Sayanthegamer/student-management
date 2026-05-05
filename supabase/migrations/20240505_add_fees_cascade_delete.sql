-- Migration: Add ON DELETE CASCADE to fees.student_id foreign key
-- Description: Ensures that when a student is deleted, their fee history is automatically removed.

-- 1. Drop existing constraint if it exists (names vary depending on how it was created, commonly fees_student_id_fkey)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fees_student_id_fkey') THEN
        ALTER TABLE public.fees DROP CONSTRAINT fees_student_id_fkey;
    END IF;
END $$;

-- 2. Add the constraint with ON DELETE CASCADE
ALTER TABLE public.fees
ADD CONSTRAINT fees_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES public.students(id)
ON DELETE CASCADE;
