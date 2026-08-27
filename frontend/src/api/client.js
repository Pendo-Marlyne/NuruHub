import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nuruhub_token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nuruhub_token')
      localStorage.removeItem('nuruhub_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  becomeContributor: () => api.post('/auth/become-contributor/'),
}

export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
}

export const coursesAPI = {
  list: () => api.get('/courses/courses/'),
  create: (data) => api.post('/courses/courses/', data),
  update: (id, data) => api.patch(`/courses/courses/${id}/`, data),
  delete: (id) => api.delete(`/courses/courses/${id}/`),
  topics: (courseId) => api.get(`/courses/courses/${courseId}/topics/`),
  createTopic: (courseId, data) => api.post(`/courses/courses/${courseId}/topics/`, data),
  exams: () => api.get('/courses/exams/'),
  createExam: (data) => api.post('/courses/exams/', data),
}

export const studyAPI = {
  plans: () => api.get('/study/plans/'),
  createPlan: (data) => api.post('/study/plans/', data),
  planTasks: (planId) => api.get(`/study/plans/${planId}/tasks/`),
  createTask: (planId, data) => api.post(`/study/plans/${planId}/tasks/`, data),
  completeTask: (planId, taskId) => api.post(`/study/plans/${planId}/tasks/${taskId}/complete/`),
  suggestPlan: (planId) => api.post(`/study/plans/${planId}/generate_suggestions/`),
  flashcards: (params) => api.get('/study/flashcards/', { params }),
  createFlashcard: (data) => api.post('/study/flashcards/', data),
  practiceFlashcards: () => api.get('/study/flashcards/practice/'),
  reviewFlashcard: (id, data) => api.post(`/study/flashcards/${id}/review/`, data),
  quizzes: () => api.get('/study/quizzes/'),
  createQuiz: (data) => api.post('/study/quizzes/', data),
  quizQuestions: (quizId) => api.get(`/study/quizzes/${quizId}/questions/`),
  submitQuiz: (data) => api.post('/study/quiz-attempts/', data),
  sessions: () => api.get('/study/sessions/'),
  startSession: (data) => api.post('/study/sessions/', data),
  completeSession: (id) => api.post(`/study/sessions/${id}/complete/`),
  analytics: () => api.get('/study/analytics/'),
  mastery: () => api.get('/study/mastery/'),
}

export const resourcesAPI = {
  list: (params) => api.get('/resources/resources/', { params }),
  get: (id) => api.get(`/resources/resources/${id}/`),
  create: (data) => api.post('/resources/resources/', data),
  books: (params) => api.get('/resources/books/', { params }),
  createBook: (data) => api.post('/resources/books/', data),
  purchase: (data) => api.post('/resources/purchase/', data),
  library: () => api.get('/resources/library/'),
  favorite: (id) => api.post(`/resources/resources/${id}/favorite/`),
  download: (id) => api.get(`/resources/resources/${id}/download/`),
  reviews: (resourceId) => api.get(`/resources/resources/${resourceId}/reviews/`),
  createReview: (resourceId, data) => api.post(`/resources/resources/${resourceId}/reviews/`, data),
  report: (data) => api.post('/resources/reports/', data),
  search: (q) => api.get('/resources/search/', { params: { q } }),
  categories: () => api.get('/resources/categories/'),
}

export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  unreadCount: () => api.get('/notifications/unread_count/'),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
}

export const healthAPI = {
  check: () => api.get('/health/'),
}
