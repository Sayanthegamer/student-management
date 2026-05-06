-- Migration: Fix sync_student_fee_batch RPC to include all student columns
-- Description: Drops and recreates the function with the full student column set,
-- so fields like guardian_name, dob, phone, address, admission_fee, concession_amount,
-- enrollment_type, and admission_number are no longer silently dropped on upsert.

DROP FUNCTION IF EXISTS public.sync_student_fee_batch(JSONB, JSONB, UUID[]);

CREATE OR REPLACE FUNCTION public.sync_student_fee_batch(
    p_students JSONB,
    p_fees JSONB,
    p_replace_fee_student_ids UUID[]
) RETURNS VOID AS $$
BEGIN
    -- 1. Bulk upsert students using a single set-based operation
    --    All student columns are included so partial updates cannot silently drop fields.
    INSERT INTO public.students (
        id, name, roll_no, class, section, status,
        guardian_name, dob, phone, email, address,
        admission_number, admission_date,
        last_status_change_date, last_status_changed_by,
        admission_fee, concession_amount, enrollment_type,
        tuition_fee, smart_board_fee, computer_fee, tc_details
    )
    SELECT
        id, name, roll_no, class, section, status,
        guardian_name, dob, phone, email, address,
        admission_number, admission_date,
        last_status_change_date, last_status_changed_by,
        admission_fee, concession_amount, enrollment_type,
        tuition_fee, smart_board_fee, computer_fee, tc_details
    FROM jsonb_to_recordset(p_students) AS x(
        id UUID,
        name TEXT,
        roll_no TEXT,
        class TEXT,
        section TEXT,
        status TEXT,
        guardian_name TEXT,
        dob DATE,
        phone TEXT,
        email TEXT,
        address TEXT,
        admission_number TEXT,
        admission_date DATE,
        last_status_change_date DATE,
        last_status_changed_by TEXT,
        admission_fee NUMERIC,
        concession_amount NUMERIC,
        enrollment_type TEXT,
        tuition_fee NUMERIC,
        smart_board_fee NUMERIC,
        computer_fee NUMERIC,
        tc_details TEXT
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        roll_no = EXCLUDED.roll_no,
        class = EXCLUDED.class,
        section = EXCLUDED.section,
        status = EXCLUDED.status,
        guardian_name = EXCLUDED.guardian_name,
        dob = EXCLUDED.dob,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        admission_number = EXCLUDED.admission_number,
        admission_date = EXCLUDED.admission_date,
        last_status_change_date = EXCLUDED.last_status_change_date,
        last_status_changed_by = EXCLUDED.last_status_changed_by,
        admission_fee = EXCLUDED.admission_fee,
        concession_amount = EXCLUDED.concession_amount,
        enrollment_type = EXCLUDED.enrollment_type,
        tuition_fee = EXCLUDED.tuition_fee,
        smart_board_fee = EXCLUDED.smart_board_fee,
        computer_fee = EXCLUDED.computer_fee,
        tc_details = EXCLUDED.tc_details;

    -- 2. Bulk upsert fees using a single set-based operation
    --    Uses the description field (JSON string with remarks/fine) matching the fees schema.
    IF jsonb_array_length(p_fees) > 0 THEN
        INSERT INTO public.fees (id, student_id, date, amount, type, month, description, itemized_breakdown)
        SELECT id, student_id, date, amount, type, month, description, itemized_breakdown
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
            amount = EXCLUDED.amount,
            date = EXCLUDED.date,
            type = EXCLUDED.type,
            month = EXCLUDED.month,
            description = EXCLUDED.description,
            itemized_breakdown = EXCLUDED.itemized_breakdown;
    END IF;

    -- 3. Delete orphaned fees for students in p_replace_fee_student_ids
    IF array_length(p_replace_fee_student_ids, 1) > 0 THEN
        DELETE FROM public.fees
        WHERE student_id = ANY(p_replace_fee_student_ids)
        AND id NOT IN (SELECT id FROM jsonb_to_recordset(p_fees) AS x(id UUID));
    END IF;

END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Revoke and grant execute permissions
REVOKE EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) TO anon, authenticated, service_role;
