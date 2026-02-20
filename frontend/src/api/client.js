import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
})

export async function optimizeCode(code, language) {
  const { data } = await client.post('/api/optimize-code', { code, language })
  return data
}

export async function optimizeRepo(repoUrl, filePath) {
  const { data } = await client.post('/api/optimize-repo', { repoUrl, filePath })
  return data
}
