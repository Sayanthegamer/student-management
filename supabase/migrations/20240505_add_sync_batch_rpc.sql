-- Migration: Add sync_student_fee_batch RPC
-- Description: Provides a transactional way to upsert students and their fees in a single call.

CREATE OR REPLACE FUNCTION public.sync_student_fee_batch(
    p_students JSONB,
    p_fees JSONB,
    p_replace_fee_student_ids UUID[]
) RETURNS VOID AS $$
DECLARE
    student_record RECORD;
BEGIN
    -- 1. Upsert students
    FOR student_record IN SELECT * FROM jsonb_to_recordset(p_students) AS x(
        id UUID, 
        name TEXT, 
        roll_no TEXT, 
        class TEXT, 
        section TEXT, 
        admission_status TEXT, 
        tuition_fee NUMERIC, 
        smart_board_fee NUMERIC, 
        computer_fee NUMERIC, 
        last_status_change_date DATE, 
        last_status_changed_by TEXT
    ) LOOP
        INSERT INTO public.students (
            id, name, roll_no, class, section, admission_status, 
            tuition_fee, smart_board_fee, computer_fee, 
            last_status_change_date, last_status_changed_by
        ) VALUES (
            student_record.id, student_record.name, student_record.roll_no, student_record.class, student_record.section, student_record.admission_status,
            student_record.tuition_fee, student_record.smart_board_fee, student_record.computer_fee,
            student_record.last_status_change_date, student_record.last_status_changed_by
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            roll_no = EXCLUDED.roll_no,
            class = EXCLUDED.class,
            section = EXCLUDED.section,
            admission_status = EXCLUDED.admission_status,
            tuition_fee = EXCLUDED.tuition_fee,
            smart_board_fee = EXCLUDED.smart_board_fee,
            computer_fee = EXCLUDED.computer_fee,
            last_status_change_date = EXCLUDED.last_status_change_date,
            last_status_changed_by = EXCLUDED.last_status_changed_by;
    END LOOP;

    -- 2. Upsert fees
    IF jsonb_array_length(p_fees) > 0 THEN
        FOR student_record IN SELECT * FROM jsonb_to_recordset(p_fees) AS x(
            id UUID,
            student_id UUID,
            date DATE,
            amount NUMERIC,
            type TEXT,
            month TEXT,
            fine NUMERIC
        ) LOOP
            INSERT INTO public.fees (id, student_id, date, amount, type, month, fine)
            VALUES (student_record.id, student_record.student_id, student_record.date, student_record.amount, student_record.type, student_record.month, student_record.fine)
            ON CONFLICT (id) DO UPDATE SET
                amount = EXCLUDED.amount,
                date = EXCLUDED.date,
                type = EXCLUDED.type,
                month = EXCLUDED.month,
                fine = EXCLUDED.fine;
        END LOOP;
    END IF;

    -- 3. Delete orphaned fees for students in p_replace_fee_student_ids
    IF array_length(p_replace_fee_student_ids, 1) > 0 THEN
        DELETE FROM public.fees
        WHERE student_id = ANY(p_replace_fee_student_ids)
        AND id NOT IN (SELECT id FROM jsonb_to_recordset(p_fees) AS x(id UUID));
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
