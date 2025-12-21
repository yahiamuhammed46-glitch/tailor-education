-- Create curriculums table to store uploaded curriculum files
CREATE TABLE public.curriculums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  education_level TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics/units table extracted from curriculum
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  questions_per_topic INTEGER NOT NULL DEFAULT 5,
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_topics junction table
CREATE TABLE public.exam_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  UNIQUE(exam_id, topic_id)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multipleChoice', 'trueFalse', 'shortAnswer', 'scenario')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_attempts table for student submissions
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  score NUMERIC(5,2),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired'))
);

-- Create student_answers table
CREATE TABLE public.student_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

-- Create topic_scores table for analysis per topic
CREATE TABLE public.topic_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'weak' CHECK (status IN ('mastered', 'good', 'average', 'weak', 'needs_review')),
  UNIQUE(attempt_id, topic_id)
);

-- Create analysis_reports table for AI-generated insights
CREATE TABLE public.analysis_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE UNIQUE,
  start_point_topic_id UUID REFERENCES public.topics(id),
  start_point_description TEXT,
  strengths JSONB,
  weaknesses JSONB,
  recommendations JSONB,
  overall_assessment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (no authentication required for this demo)
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for demo without auth)
CREATE POLICY "Public access for curriculums" ON public.curriculums FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for topics" ON public.topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for exam_topics" ON public.exam_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for exam_attempts" ON public.exam_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for student_answers" ON public.student_answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for topic_scores" ON public.topic_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for analysis_reports" ON public.analysis_reports FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for curriculum files
INSERT INTO storage.buckets (id, name, public) VALUES ('curriculums', 'curriculums', true);

-- Create storage policy for public access
CREATE POLICY "Public access to curriculum files" ON storage.objects FOR ALL USING (bucket_id = 'curriculums') WITH CHECK (bucket_id = 'curriculums');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for curriculums table
CREATE TRIGGER update_curriculums_updated_at
  BEFORE UPDATE ON public.curriculums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_topics_curriculum ON public.topics(curriculum_id);
CREATE INDEX idx_exams_curriculum ON public.exams(curriculum_id);
CREATE INDEX idx_questions_exam ON public.questions(exam_id);
CREATE INDEX idx_questions_topic ON public.questions(topic_id);
CREATE INDEX idx_exam_attempts_exam ON public.exam_attempts(exam_id);
CREATE INDEX idx_student_answers_attempt ON public.student_answers(attempt_id);
CREATE INDEX idx_topic_scores_attempt ON public.topic_scores(attempt_id);