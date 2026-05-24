-- Migration: Fix sync_student_fee_batch and full_replace_import by removing tc_details
-- Context: tc_details was dropped but accidentally reintroduced in the multi-tenant migration

-- 1. Update sync_student_fee_batch
DROP FUNCTION IF EXISTS public.sync_student_fee_batch(JSONB, JSONB, UUID[]);

CREATE OR REPLACE FUNCTION public.sync_student_fee_batch(
    p_students JSONB,
    p_fees JSONB,
    p_replace_fee_student_ids UUID[]
) RETURNS VOID AS $$
DECLARE
    current_uid UUID;
BEGIN
    current_uid := auth.uid();
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Stage 1: Bulk upsert students
    IF jsonb_typeof(p_students) = 'array' AND jsonb_array_length(p_students) > 0 THEN
        INSERT INTO public.students (
            id, user_id, name, roll_no, class, section, status, admission_date,
            guardian_name, dob, phone, address, email, admission_number,
            enrollment_type, admission_fee, concession_amount, tuition_fee,
            smart_board_fee, computer_fee, last_status_change_date,
            last_status_changed_by
        )
        SELECT
            id, current_uid, name, roll_no, class, section, status, admission_date,
            guardian_name, dob::DATE, phone, address, email, admission_number,
            enrollment_type, admission_fee, concession_amount, tuition_fee,
            smart_board_fee, computer_fee, last_status_change_date,
            last_status_changed_by
        FROM jsonb_to_recordset(p_students) AS x(
            id UUID, name TEXT, roll_no TEXT, class TEXT, section TEXT,
            status TEXT, admission_date DATE, guardian_name TEXT, dob TEXT,
            phone TEXT, address TEXT, email TEXT, admission_number TEXT,
            enrollment_type TEXT, admission_fee NUMERIC, concession_amount NUMERIC,
            tuition_fee NUMERIC, smart_board_fee NUMERIC, computer_fee NUMERIC,
            last_status_change_date DATE, last_status_changed_by TEXT
        )
        ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
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
            last_status_changed_by = COALESCE(EXCLUDED.last_status_changed_by, public.students.last_status_changed_by)
        WHERE public.students.user_id = current_uid;
    END IF;

    -- Stage 2: Bulk upsert fees
    IF jsonb_typeof(p_fees) = 'array' AND jsonb_array_length(p_fees) > 0 THEN
        INSERT INTO public.fees (
            id, user_id, student_id, date, amount, type, month, description, itemized_breakdown
        )
        SELECT
            id, current_uid, student_id, date, amount, type, month, description, itemized_breakdown
        FROM jsonb_to_recordset(p_fees) AS x(
            id UUID, student_id UUID, date DATE, amount NUMERIC, type TEXT,
            month TEXT, description TEXT, itemized_breakdown JSONB
        )
        ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            student_id = EXCLUDED.student_id,
            amount = EXCLUDED.amount,
            date = EXCLUDED.date,
            type = EXCLUDED.type,
            month = EXCLUDED.month,
            description = EXCLUDED.description,
            itemized_breakdown = EXCLUDED.itemized_breakdown
        WHERE public.fees.user_id = current_uid;
    END IF;

    -- Stage 3: Delete orphaned fees for targeted students
    IF array_length(p_replace_fee_student_ids, 1) > 0 THEN
        DELETE FROM public.fees
        WHERE user_id = current_uid
          AND student_id = ANY(p_replace_fee_student_ids)
          AND (
              jsonb_typeof(p_fees) != 'array'
              OR id NOT IN (
                  SELECT id FROM jsonb_to_recordset(p_fees) AS x(id UUID)
              )
          );
    END IF;

END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_student_fee_batch(JSONB, JSONB, UUID[]) TO anon, authenticated, service_role;


-- 2. Update full_replace_import
DROP FUNCTION IF EXISTS full_replace_import(uuid, jsonb, jsonb);

CREATE OR REPLACE FUNCTION full_replace_import(p_user_id uuid, students jsonb, fees jsonb)
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
    -- Authorization guard: only allow execution by specific roles
    IF NOT pg_has_role(session_user, 'service_role', 'USAGE') AND session_user != 'postgres' THEN
        RAISE EXCEPTION 'Unauthorized: must have service_role or be postgres superuser';
    END IF;

    -- Upsert students
    FOR student_record IN SELECT * FROM jsonb_to_recordset(students) AS x(
        id uuid, name text, guardian_name text, class text, section text,
        address text, phone text, email text, admission_date timestamptz,
        admission_number text, roll_no text, status text,
        last_status_change_date date, last_status_changed_by text,
        admission_fee numeric, concession_amount numeric, dob date,
        enrollment_type text, tuition_fee numeric, smart_board_fee numeric,
        computer_fee numeric
    )
    LOOP
        INSERT INTO public.students (
            id, user_id, name, guardian_name, class, section, address, phone, email,
            admission_date, admission_number, roll_no, status,
            last_status_change_date, last_status_changed_by, admission_fee,
            concession_amount, dob, enrollment_type, tuition_fee,
            smart_board_fee, computer_fee
        ) VALUES (
            student_record.id, p_user_id, student_record.name, student_record.guardian_name,
            student_record.class, student_record.section, student_record.address,
            student_record.phone, student_record.email, student_record.admission_date,
            student_record.admission_number, student_record.roll_no, student_record.status,
            student_record.last_status_change_date,
            student_record.last_status_changed_by, student_record.admission_fee,
            student_record.concession_amount, student_record.dob, student_record.enrollment_type,
            student_record.tuition_fee, student_record.smart_board_fee, student_record.computer_fee
        )
        ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
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
            computer_fee = EXCLUDED.computer_fee
        WHERE public.students.user_id = p_user_id;

        kept_student_ids := array_append(kept_student_ids, student_record.id);
    END LOOP;

    -- Upsert fees
    IF fees IS NOT NULL AND jsonb_array_length(fees) > 0 THEN
        FOR fee_record IN SELECT * FROM jsonb_to_recordset(fees) AS x(
            id uuid, student_id uuid, amount numeric, date timestamptz,
            month text, type text, description text, itemized_breakdown jsonb
        )
        LOOP
            INSERT INTO public.fees (
                id, user_id, student_id, amount, date, month, type, description, itemized_breakdown
            ) VALUES (
                fee_record.id, p_user_id, fee_record.student_id, fee_record.amount, fee_record.date,
                fee_record.month, fee_record.type, fee_record.description, fee_record.itemized_breakdown
            )
            ON CONFLICT (id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                student_id = EXCLUDED.student_id,
                amount = EXCLUDED.amount,
                date = EXCLUDED.date,
                month = EXCLUDED.month,
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                itemized_breakdown = EXCLUDED.itemized_breakdown
            WHERE public.fees.user_id = p_user_id;

            kept_fee_ids := array_append(kept_fee_ids, fee_record.id);
        END LOOP;
    END IF;

    -- Delete orphaned fees
    DELETE FROM public.fees
    WHERE user_id = p_user_id
    AND id != '00000000-0000-0000-0000-000000000000'::uuid
    AND NOT (id = ANY(kept_fee_ids));

    -- Delete orphaned students
    DELETE FROM public.students
    WHERE user_id = p_user_id
    AND id != '00000000-0000-0000-0000-000000000000'::uuid
    AND NOT (id = ANY(kept_student_ids));
END;
$$;

REVOKE EXECUTE ON FUNCTION full_replace_import(uuid, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION full_replace_import(uuid, jsonb, jsonb) TO service_role;
