-- Migration: Create initial schema
-- Description: Creates the base tables for students and fees

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    guardian_name TEXT,
    class TEXT,
    section TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    admission_date TIMESTAMP WITH TIME ZONE,
    admission_number TEXT,
    roll_no TEXT,
    status TEXT,
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_status_change_date DATE,
    last_status_changed_by TEXT,
    admission_fee NUMERIC DEFAULT 0,
    concession_amount NUMERIC DEFAULT 0,
    dob DATE,
    enrollment_type TEXT DEFAULT 'OLD'::text,
    tuition_fee NUMERIC DEFAULT 0,
    smart_board_fee NUMERIC DEFAULT 0,
    computer_fee NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id),
    amount NUMERIC,
    date TIMESTAMP WITH TIME ZONE,
    month TEXT,
    type TEXT,
    description TEXT,
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    itemized_breakdown JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
