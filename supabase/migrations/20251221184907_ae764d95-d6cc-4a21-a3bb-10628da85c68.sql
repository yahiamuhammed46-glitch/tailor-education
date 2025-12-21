-- Add content column to curriculums table to store extracted file content
ALTER TABLE public.curriculums ADD COLUMN content TEXT;