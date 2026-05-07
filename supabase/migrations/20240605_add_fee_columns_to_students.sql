-- Migration: Add fee-related columns to students table
-- These columns are referenced by sync_student_fee_batch RPC but were
-- never explicitly added via ALTER TABLE, causing 400 errors on any
-- operation that calls the RPC (transport fees, bulk promotions, etc.)

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS tuition_fee      NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS smart_board_fee  NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS computer_fee     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS admission_fee    NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS concession_amount NUMERIC DEFAULT 0;
