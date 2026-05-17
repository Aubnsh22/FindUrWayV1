import axios from 'axios'

// API base — in dev, Vite proxy forwards /api to localhost:8000
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s for NLP processing
})

/**
 * Analyze user profile — main matching endpoint
 * @param {string} text - User's profile description
 * @returns {Promise} Analysis results with matched jobs
 */
export async function analyzeProfile(text) {
  const response = await api.post('/analyze', { text })
  return response.data
}

/**
 * Search jobs with optional filters
 */
export async function searchJobs(query = 'data science', page = 1, limit = 15) {
  const response = await api.get('/jobs/search', {
    params: { query, page, limit },
  })
  return response.data
}

/**
 * Get trending skills
 */
export async function getTrendingSkills() {
  const response = await api.get('/jobs/trending')
  return response.data
}

/**
 * Get job categories
 */
export async function getCategories() {
  const response = await api.get('/jobs/categories')
  return response.data
}

/**
 * Save a job
 */
export async function saveJob(job) {
  const response = await api.post('/saved-jobs/', job)
  return response.data
}

/**
 * Get saved jobs
 */
export async function getSavedJobs() {
  const response = await api.get('/saved-jobs/')
  return response.data
}

/**
 * Delete a saved job
 */
export async function deleteSavedJob(jobId) {
  const response = await api.delete(`/saved-jobs/${jobId}`)
  return response.data
}

/**
 * Get saved jobs count
 */
export async function getSavedCount() {
  const response = await api.get('/saved-jobs/count')
  return response.data
}

/**
 * Get Morocco market intelligence
 */
export async function getMarketInsights() {
  const response = await api.get('/market/insights')
  return response.data
}

/**
 * Upload and analyze a CV/resume file
 * @param {File} file - PDF, DOCX, TXT, or image file
 */
export async function analyzeCV(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/analyze/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return response.data
}

export default api
