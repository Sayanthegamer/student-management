-- Create domains table
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    domain_url TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on domains
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create llms_files table
CREATE TABLE IF NOT EXISTS public.llms_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE UNIQUE,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on llms_files
ALTER TABLE public.llms_files ENABLE ROW LEVEL SECURITY;

-- Create leads table for early access signups
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to leads (anon inserts)
CREATE POLICY "Allow anonymous inserts to leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Create policies for public access to llms_files (since edge worker and public AI crawlers need to read it)
CREATE POLICY "Allow public read access to llms_files" ON public.llms_files
    FOR SELECT USING (true);
