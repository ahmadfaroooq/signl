import axios from 'axios'
import type { ApiResponse } from '../types'

const BASE = '/api/v1'

const http = axios.create({ baseURL: BASE })

// Attach JWT on every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('signl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap the ApiResponse envelope
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('signl_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export async function get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const res = await http.get<ApiResponse<T>>(path, { params })
  return res.data
}

export async function post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await http.post<ApiResponse<T>>(path, body)
  return res.data
}

export async function patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await http.patch<ApiResponse<T>>(path, body)
  return res.data
}

export async function del<T>(path: string): Promise<ApiResponse<T>> {
  const res = await http.delete<ApiResponse<T>>(path)
  return res.data
}

export async function put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await http.put<ApiResponse<T>>(path, body)
  return res.data
}

export default http
