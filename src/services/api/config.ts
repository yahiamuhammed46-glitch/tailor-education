// API Configuration - Update these values for your .NET API
export const API_CONFIG = {
  // Replace with your .NET API base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API Endpoints - matching your current database structure
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // Curriculums
  CURRICULUMS: {
    LIST: '/curriculums',
    GET: (id: string) => `/curriculums/${id}`,
    CREATE: '/curriculums',
    UPDATE: (id: string) => `/curriculums/${id}`,
    DELETE: (id: string) => `/curriculums/${id}`,
    ANALYZE: (id: string) => `/curriculums/${id}/analyze`,
  },
  
  // Topics
  TOPICS: {
    LIST: '/topics',
    GET: (id: string) => `/topics/${id}`,
    BY_CURRICULUM: (curriculumId: string) => `/curriculums/${curriculumId}/topics`,
  },
  
  // Exams
  EXAMS: {
    LIST: '/exams',
    GET: (id: string) => `/exams/${id}`,
    CREATE: '/exams',
    UPDATE: (id: string) => `/exams/${id}`,
    DELETE: (id: string) => `/exams/${id}`,
    GENERATE_QUESTIONS: (id: string) => `/exams/${id}/generate-questions`,
  },
  
  // Questions
  QUESTIONS: {
    LIST: '/questions',
    BY_EXAM: (examId: string) => `/exams/${examId}/questions`,
  },
  
  // Exam Attempts
  ATTEMPTS: {
    LIST: '/attempts',
    GET: (id: string) => `/attempts/${id}`,
    CREATE: '/attempts',
    UPDATE: (id: string) => `/attempts/${id}`,
    SUBMIT: (id: string) => `/attempts/${id}/submit`,
  },
  
  // Student Answers
  ANSWERS: {
    SUBMIT: '/answers',
    BY_ATTEMPT: (attemptId: string) => `/attempts/${attemptId}/answers`,
  },
  
  // Analysis
  ANALYSIS: {
    GET: (attemptId: string) => `/attempts/${attemptId}/analysis`,
    GENERATE: (attemptId: string) => `/attempts/${attemptId}/analyze`,
  },
  
  // Explain Topic
  EXPLAIN: {
    TOPIC: '/explain/topic',
  },
};
