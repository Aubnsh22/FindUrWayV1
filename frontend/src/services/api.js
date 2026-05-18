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
 * @param {Object} [prefs] - Optional preferences
 * @param {string} [prefs.preferred_city] - Preferred city (e.g. Casablanca)
 * @param {string[]} [prefs.preferred_categories] - Preferred categories
 * @param {number} [prefs.min_match_score] - Minimum match % threshold
 * @returns {Promise} Analysis results with matched jobs
 */
export async function analyzeProfile(text, prefs = {}) {
  const body = { text, ...prefs }
  const response = await api.post('/analyze', body)
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

const LS_KEY = 'findurway_saved_jobs'

function isLoggedIn() {
  return !!localStorage.getItem('token')
}

function getLocalSavedJobs() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function setLocalSavedJobs(jobs) {
  localStorage.setItem(LS_KEY, JSON.stringify(jobs))
}

/**
 * Save a job — uses localStorage if not logged in
 */
export async function saveJob(job) {
  if (!isLoggedIn()) {
    const jobs = getLocalSavedJobs()
    if (jobs.some(j => j.job_id === job.job_id)) throw new Error('Already saved')
    jobs.unshift({ ...job, id: Date.now() })
    setLocalSavedJobs(jobs)
    return jobs[0]
  }
  const response = await api.post('/saved-jobs/', job)
  return response.data
}

/**
 * Get saved jobs — uses localStorage if not logged in
 */
export async function getSavedJobs() {
  if (!isLoggedIn()) {
    return getLocalSavedJobs()
  }
  const response = await api.get('/saved-jobs/')
  return response.data
}

/**
 * Delete a saved job — uses localStorage if not logged in
 */
export async function deleteSavedJob(jobId) {
  if (!isLoggedIn()) {
    const jobs = getLocalSavedJobs().filter(j => j.job_id !== jobId)
    setLocalSavedJobs(jobs)
    return { message: 'Removed', job_id: jobId }
  }
  const response = await api.delete(`/saved-jobs/${jobId}`)
  return response.data
}

/**
 * Get saved jobs count — uses localStorage if not logged in
 */
export async function getSavedCount() {
  if (!isLoggedIn()) {
    return { count: getLocalSavedJobs().length }
  }
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

/**
 * Sign up a new user
 */
export async function signupUser(email, username, password) {
  const res = await api.post('/auth/signup', { email, username, password })
  return res.data
}

/**
 * Log in an existing user
 */
export async function loginUser(username, password) {
  const res = await api.post('/auth/login', { username, password })
  return res.data
}

/**
 * Get current user profile
 */
export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data
}

/**
 * Get current user's analysis history
 */
export async function getHistory() {
  const res = await api.get('/auth/history')
  return res.data
}

export default api
