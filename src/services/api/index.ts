import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './config';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Curriculum,
  CreateCurriculumRequest,
  Topic,
  Exam,
  CreateExamRequest,
  Question,
  ExamAttempt,
  StudentAnswer,
  SubmitAnswerRequest,
  AnalysisReport,
  ExplainTopicRequest,
  User,
} from './types';

// Auth Service
export const authApi = {
  async login(credentials: LoginRequest) {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    if (response.data?.token) {
      httpClient.setAuthToken(response.data.token);
    }
    return response;
  },

  async register(data: RegisterRequest) {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    if (response.data?.token) {
      httpClient.setAuthToken(response.data.token);
    }
    return response;
  },

  async logout() {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    httpClient.setAuthToken(null);
    return response;
  },

  async getProfile() {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  },

  async refreshToken() {
    return httpClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
  },
};

// Curriculums Service
export const curriculumsApi = {
  async list() {
    return httpClient.get<Curriculum[]>(API_ENDPOINTS.CURRICULUMS.LIST);
  },

  async get(id: string) {
    return httpClient.get<Curriculum>(API_ENDPOINTS.CURRICULUMS.GET(id));
  },

  async create(data: CreateCurriculumRequest) {
    if (data.file) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subject', data.subject);
      formData.append('education_level', data.education_level);
      formData.append('file', data.file);
      return httpClient.upload<Curriculum>(API_ENDPOINTS.CURRICULUMS.CREATE, formData);
    }
    return httpClient.post<Curriculum>(API_ENDPOINTS.CURRICULUMS.CREATE, data);
  },

  async update(id: string, data: Partial<Curriculum>) {
    return httpClient.put<Curriculum>(API_ENDPOINTS.CURRICULUMS.UPDATE(id), data);
  },

  async delete(id: string) {
    return httpClient.delete(API_ENDPOINTS.CURRICULUMS.DELETE(id));
  },

  async analyze(id: string) {
    return httpClient.post<{ topics: Topic[] }>(API_ENDPOINTS.CURRICULUMS.ANALYZE(id));
  },
};

// Topics Service
export const topicsApi = {
  async list() {
    return httpClient.get<Topic[]>(API_ENDPOINTS.TOPICS.LIST);
  },

  async get(id: string) {
    return httpClient.get<Topic>(API_ENDPOINTS.TOPICS.GET(id));
  },

  async getByCurriculum(curriculumId: string) {
    return httpClient.get<Topic[]>(API_ENDPOINTS.TOPICS.BY_CURRICULUM(curriculumId));
  },
};

// Exams Service
export const examsApi = {
  async list() {
    return httpClient.get<Exam[]>(API_ENDPOINTS.EXAMS.LIST);
  },

  async get(id: string) {
    return httpClient.get<Exam>(API_ENDPOINTS.EXAMS.GET(id));
  },

  async create(data: CreateExamRequest) {
    return httpClient.post<Exam>(API_ENDPOINTS.EXAMS.CREATE, data);
  },

  async update(id: string, data: Partial<Exam>) {
    return httpClient.put<Exam>(API_ENDPOINTS.EXAMS.UPDATE(id), data);
  },

  async delete(id: string) {
    return httpClient.delete(API_ENDPOINTS.EXAMS.DELETE(id));
  },

  async generateQuestions(id: string, data: { topic_ids: string[]; questions_per_topic: number; difficulty: string }) {
    return httpClient.post<{ questions: Question[] }>(
      API_ENDPOINTS.EXAMS.GENERATE_QUESTIONS(id),
      data
    );
  },
};

// Questions Service
export const questionsApi = {
  async list() {
    return httpClient.get<Question[]>(API_ENDPOINTS.QUESTIONS.LIST);
  },

  async getByExam(examId: string) {
    return httpClient.get<Question[]>(API_ENDPOINTS.QUESTIONS.BY_EXAM(examId));
  },
};

// Attempts Service
export const attemptsApi = {
  async list() {
    return httpClient.get<ExamAttempt[]>(API_ENDPOINTS.ATTEMPTS.LIST);
  },

  async get(id: string) {
    return httpClient.get<ExamAttempt>(API_ENDPOINTS.ATTEMPTS.GET(id));
  },

  async create(data: { exam_id: string; student_name: string; student_email?: string }) {
    return httpClient.post<ExamAttempt>(API_ENDPOINTS.ATTEMPTS.CREATE, data);
  },

  async update(id: string, data: Partial<ExamAttempt>) {
    return httpClient.put<ExamAttempt>(API_ENDPOINTS.ATTEMPTS.UPDATE(id), data);
  },

  async submit(id: string) {
    return httpClient.post<ExamAttempt>(API_ENDPOINTS.ATTEMPTS.SUBMIT(id));
  },
};

// Answers Service
export const answersApi = {
  async submit(data: SubmitAnswerRequest) {
    return httpClient.post<StudentAnswer>(API_ENDPOINTS.ANSWERS.SUBMIT, data);
  },

  async getByAttempt(attemptId: string) {
    return httpClient.get<StudentAnswer[]>(API_ENDPOINTS.ANSWERS.BY_ATTEMPT(attemptId));
  },
};

// Analysis Service
export const analysisApi = {
  async get(attemptId: string) {
    return httpClient.get<AnalysisReport>(API_ENDPOINTS.ANALYSIS.GET(attemptId));
  },

  async generate(attemptId: string) {
    return httpClient.post<AnalysisReport>(API_ENDPOINTS.ANALYSIS.GENERATE(attemptId));
  },
};

// Explain Service
export const explainApi = {
  async explain(data: ExplainTopicRequest) {
    return httpClient.post<{ explanation: string }>(API_ENDPOINTS.EXPLAIN.TOPIC, data);
  },
};

// Export all
export * from './types';
export { httpClient } from './httpClient';
export { API_CONFIG, API_ENDPOINTS } from './config';
