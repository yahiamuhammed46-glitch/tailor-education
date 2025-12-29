// API Types matching the current database structure

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface Curriculum {
  id: string;
  name: string;
  subject: string;
  education_level: string;
  content?: string;
  file_name?: string;
  file_url?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  curriculum_id: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  curriculum_id: string;
  difficulty: string;
  duration_minutes: number;
  questions_per_topic: number;
  shuffle_questions: boolean;
  user_id?: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  topic_id: string;
  question_text: string;
  question_type: string;
  options?: any[];
  correct_answer: string;
  explanation?: string;
  difficulty: string;
  order_index: number;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id?: string;
  student_name: string;
  student_email?: string;
  started_at: string;
  completed_at?: string;
  time_spent_seconds?: number;
  score?: number;
  total_questions: number;
  correct_answers: number;
  status: string;
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer?: string;
  is_correct?: boolean;
  answered_at?: string;
}

export interface TopicScore {
  id: string;
  attempt_id: string;
  topic_id: string;
  correct_answers: number;
  total_questions: number;
  score: number;
  status: string;
}

export interface AnalysisReport {
  id: string;
  attempt_id: string;
  overall_assessment?: string;
  strengths?: any[];
  weaknesses?: any[];
  recommendations?: any[];
  start_point_topic_id?: string;
  start_point_description?: string;
  created_at: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'teacher' | 'student';
}

export interface CreateCurriculumRequest {
  name: string;
  subject: string;
  education_level: string;
  file?: File;
}

export interface CreateExamRequest {
  title: string;
  curriculum_id: string;
  topic_ids: string[];
  difficulty: string;
  duration_minutes: number;
  questions_per_topic: number;
  shuffle_questions?: boolean;
}

export interface SubmitAnswerRequest {
  attempt_id: string;
  question_id: string;
  answer: string;
}

export interface ExplainTopicRequest {
  question: string;
  curriculum_id: string;
  topic_id: string;
  conversation_history?: { role: string; content: string }[];
}
