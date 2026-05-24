-- Migration: Recreate sync_student_fee_batch RPC without tc_details and correct DOB type
-- Context: tc_details is removed; also ensure dob is DATE (not TEXT)
-- Keeps: description field in fees and orphan-delete semantics

DROP FUNCTION IF EXISTS public.sync_student_fee_batch(JSONB, JSONB, UUID[]);

CREATE OR REPLACE FUNCTION public.sync_student_fee_batch(
    p_students JSONB,
    p_fees JSONB,
    p_replace_fee_student_ids UUID[]
) RETURNS VOID AS $$
BEGIN
    -- Stage 1: Bulk upsert students (full column set, excluding tc_details)
    IF jsonb_typeof(p_students) = 'array' AND jsonb_array_length(p_students) > 0 THEN
        INSERT INTO public.students (
            id,
            name,
            roll_no,
            class,
            section,
            status,
            admission_date,
            guardian_name,
            dob,
            phone,
            address,
            email,
            admission_number,
            enrollment_type,
            admission_fee,
            concession_amount,
            tuition_fee,
            smart_board_fee,
            computer_fee,
            last_status_change_date,
            last_status_changed_by
        )
        SELECT
            id,
            name,
            roll_no,
            class,
            section,
            status,
            admission_date,
            guardian_name,
            dob,
            phone,
            address,
            email,
            admission_number,
            enrollment_type,
            admission_fee,
            concession_amount,
            tuition_fee,
            smart_board_fee,
            computer_fee,
            last_status_change_date,
            last_status_changed_by
        FROM jsonb_to_recordset(p_students) AS x(
            id UUID,
            name TEXT,
            roll_no TEXT,
            class TEXT,
            section TEXT,
            status TEXT,
            admission_date DATE,
            guardian_name TEXT,
            dob DATE,
            phone TEXT,
            address TEXT,
            email TEXT,
            admission_number TEXT,
            enrollment_type TEXT,
            admission_fee NUMERIC,
            concession_amount NUMERIC,
            tuition_fee NUMERIC,
            smart_board_fee NUMERIC,
            computer_fee NUMERIC,
            last_status_change_date DATE,
            last_status_changed_by TEXT
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            roll_no = EXCLUDED.roll_no,
            class = EXCLUDED.class,
            section = EXCLUDED.section,
            status = EXCLUDED.status,
            admission_date = COALESCE(EXCLUDED.admission_date, public.students.admission_date),
            guardian_name = COALESCE(EXCLUDED.guardian_name, public.students.guardian_name),
            dob = COALESCE(EXCLUDED.dob, public.students.dob),
            phone = COALESCE(EXCLUDED.phone, public.students.phone),
            address = COALESCE(EXCLUDED.address, public.students.address),
            email = COALESCE(EXCLUDED.email, public.students.email),
            admission_number = COALESCE(EXCLUDED.admission_number, public.students.admission_number),
            enrollment_type = COALESCE(EXCLUDED.enrollment_type, public.students.enrollment_type),
            admission_fee = COALESCE(EXCLUDED.admission_fee, public.students.admission_fee),
            concession_amount = COALESCE(EXCLUDED.concession_amount, public.students.concession_amount),
            tuition_fee = COALESCE(EXCLUDED.tuition_fee, public.students.tuition_fee),
            smart_board_fee = COALESCE(EXCLUDED.smart_board_fee, public.students.smart_board_fee),
            computer_fee = COALESCE(EXCLUDED.computer_fee, public.students.computer_fee),
            last_status_change_date = COALESCE(EXCLUDED.last_status_change_date, public.students.last_status_change_date),
            last_status_changed_by = COALESCE(EXCLUDED.last_status_changed_by, public.students.last_status_changed_by);
    END IF;

    -- Stage 2: Bulk upsert fees using description
    IF jsonb_typeof(p_fees) = 'array' AND jsonb_array_length(p_fees) > 0 THEN
        INSERT INTO public.fees (
            id,
            student_id,
            date,
            amount,
            type,
            month,
            description,
            itemized_breakdown
        )
        SELECT
            id,
            student_id,
            date,
            amount,
            type,
            month,
            description,
            itemized_breakdown
        FROM jsonb_to_recordset(p_fees) AS x(
            id UUID,
            student_id UUID,
            date DATE,
            amount NUMERIC,
            type TEXT,
            month TEXT,
            description TEXT,
            itemized_breakdown JSONB
        )
        ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id,
            amount = EXCLUDED.amount,
            date = EXCLUDED.date,
            type = EXCLUDED.type,
            month = EXCLUDED.month,
            description = EXCLUDED.description,
            itemized_breakdown = EXCLUDED.itemized_breakdown;
    END IF;

    -- Stage 3: Delete orphaned fees when replacing
    IF array_length(p_replace_fee_student_ids, 1) > 0 THEN
        DELETE FROM public.fees
        WHERE student_id = ANY(p_replace_fee_student_ids)
          AND (
            jsonb_typeof(p_fees) != 'array'
            OR id NOT IN (SELECT id FROM jsonb_to_recordset(p_fees) AS x(id UUID))
          );
    END IF;

END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) TO anon, authenticated, service_role;
