-- Create the 'speaking_questions' table
CREATE TABLE IF NOT EXISTS public.speaking_questions (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date timestamp with time zone NOT NULL DEFAULT now(),
    last_used timestamp with time zone,
    type text NOT NULL CHECK (type IN ('Part 1.1', 'Part 1.2', 'Part 2', 'Part 3')),
    sub_questions text[],
    image_urls text[],
    question_text text
);

-- Create the 'recordings' table
CREATE TABLE IF NOT EXISTS public.recordings (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
    duration integer NOT NULL,
    student_id text,
    student_name text,
    student_phone text,
    video_url text NOT NULL
);

-- Create the 'mood_entries' table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date timestamp with time zone NOT NULL DEFAULT now(),
    mood text NOT NULL,
    text text NOT NULL
);

-- Helper function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for 'speaking_questions'
DROP TRIGGER IF EXISTS on_speaking_questions_insert ON public.speaking_questions;
CREATE TRIGGER on_speaking_questions_insert
BEFORE INSERT ON public.speaking_questions
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Trigger for 'recordings'
DROP TRIGGER IF EXISTS on_recordings_insert ON public.recordings;
CREATE TRIGGER on_recordings_insert
BEFORE INSERT ON public.recordings
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Trigger for 'mood_entries'
DROP TRIGGER IF EXISTS on_mood_entries_insert ON public.mood_entries;
CREATE TRIGGER on_mood_entries_insert
BEFORE INSERT ON public.mood_entries
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();


-- Enable Row Level Security for all tables
ALTER TABLE public.speaking_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to manage their own questions" ON public.speaking_questions;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own recordings" ON public.recordings;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Allow public read access to question images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload question images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own question images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own recordings storage" ON storage.objects;


-- Policies for 'speaking_questions' table
CREATE POLICY "Allow authenticated users to manage their own questions"
ON public.speaking_questions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for 'recordings' table
CREATE POLICY "Allow authenticated users to manage their own recordings"
ON public.recordings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for 'mood_entries' table
CREATE POLICY "Allow authenticated users to manage their own mood entries"
ON public.mood_entries
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Policies for 'question-images' bucket in Storage
CREATE POLICY "Allow public read access to question images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'question-images');

CREATE POLICY "Allow authenticated users to upload question images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-images' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Allow authenticated users to delete their own question images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-images' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Policies for 'recordings' bucket in Storage
CREATE POLICY "Allow authenticated users to manage their own recordings storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'recordings' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
)
WITH CHECK (
  bucket_id = 'recordings' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);