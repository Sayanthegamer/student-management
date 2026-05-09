-- Function runs as SECURITY DEFINER to allow upserting/deleting records,
-- bypassing RLS, but is restricted to specific authorized roles via the guard below.
CREATE OR REPLACE FUNCTION full_replace_import(students jsonb, fees jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    student_record RECORD;
    fee_record RECORD;
    kept_student_ids uuid[] := ARRAY[]::uuid[];
    kept_fee_ids uuid[] := ARRAY[]::uuid[];
BEGIN
    -- Authorization guard: only allow execution by specific roles (e.g., service_role or postgres)
    IF NOT pg_has_role(session_user, 'service_role', 'USAGE') AND session_user != 'postgres' THEN
        RAISE EXCEPTION 'Unauthorized: must have service_role or be postgres superuser';
    END IF;

    -- Upsert students
    FOR student_record IN SELECT * FROM jsonb_to_recordset(students) AS x(
        id uuid,
        name text,
        guardian_name text,
        class text,
        section text,
        address text,
        phone text,
        email text,
        admission_date timestamptz,
        admission_number text,
        roll_no text,
        status text,
        last_status_change_date date,
        last_status_changed_by text,
        admission_fee numeric,
        concession_amount numeric,
        dob date,
        enrollment_type text,
        tuition_fee numeric,
        smart_board_fee numeric,
        computer_fee numeric
    )
    LOOP
        INSERT INTO public.students (
            id, name, guardian_name, class, section, address, phone, email,
            admission_date, admission_number, roll_no, status,
            last_status_change_date, last_status_changed_by, admission_fee,
            concession_amount, dob, enrollment_type, tuition_fee,
            smart_board_fee, computer_fee
        ) VALUES (
            student_record.id, student_record.name, student_record.guardian_name,
            student_record.class, student_record.section, student_record.address,
            student_record.phone, student_record.email, student_record.admission_date,
            student_record.admission_number, student_record.roll_no, student_record.status,
            student_record.last_status_change_date,
            student_record.last_status_changed_by, student_record.admission_fee,
            student_record.concession_amount, student_record.dob, student_record.enrollment_type,
            student_record.tuition_fee, student_record.smart_board_fee, student_record.computer_fee
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            guardian_name = EXCLUDED.guardian_name,
            class = EXCLUDED.class,
            section = EXCLUDED.section,
            address = EXCLUDED.address,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            admission_date = EXCLUDED.admission_date,
            admission_number = EXCLUDED.admission_number,
            roll_no = EXCLUDED.roll_no,
            status = EXCLUDED.status,
            last_status_change_date = EXCLUDED.last_status_change_date,
            last_status_changed_by = EXCLUDED.last_status_changed_by,
            admission_fee = EXCLUDED.admission_fee,
            concession_amount = EXCLUDED.concession_amount,
            dob = EXCLUDED.dob,
            enrollment_type = EXCLUDED.enrollment_type,
            tuition_fee = EXCLUDED.tuition_fee,
            smart_board_fee = EXCLUDED.smart_board_fee,
            computer_fee = EXCLUDED.computer_fee;

        kept_student_ids := array_append(kept_student_ids, student_record.id);
    END LOOP;

    -- Upsert fees
    IF fees IS NOT NULL AND jsonb_array_length(fees) > 0 THEN
        FOR fee_record IN SELECT * FROM jsonb_to_recordset(fees) AS x(
            id uuid,
            student_id uuid,
            amount numeric,
            date timestamptz,
            month text,
            type text,
            description text,
            itemized_breakdown jsonb
        )
        LOOP
            INSERT INTO public.fees (
                id, student_id, amount, date, month, type, description, itemized_breakdown
            ) VALUES (
                fee_record.id, fee_record.student_id, fee_record.amount, fee_record.date,
                fee_record.month, fee_record.type, fee_record.description, fee_record.itemized_breakdown
            )
            ON CONFLICT (id) DO UPDATE SET
                student_id = EXCLUDED.student_id,
                amount = EXCLUDED.amount,
                date = EXCLUDED.date,
                month = EXCLUDED.month,
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                itemized_breakdown = EXCLUDED.itemized_breakdown;

            kept_fee_ids := array_append(kept_fee_ids, fee_record.id);
        END LOOP;
    END IF;

    -- Delete orphaned fees
    DELETE FROM public.fees
    WHERE id != '00000000-0000-0000-0000-000000000000'::uuid
    AND NOT (id = ANY(kept_fee_ids));

    -- Delete orphaned students
    DELETE FROM public.students
    WHERE id != '00000000-0000-0000-0000-000000000000'::uuid
    AND NOT (id = ANY(kept_student_ids));
END;
$$;

-- Lock down execution permission
REVOKE EXECUTE ON FUNCTION full_replace_import(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION full_replace_import(jsonb, jsonb) TO service_role;
