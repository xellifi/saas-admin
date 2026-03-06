import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              })

              const { accessToken } = response.data.data
              localStorage.setItem('accessToken', accessToken)

              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data)
    return response.data
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url)
    return response.data
  }

  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('accessToken')

    // Use a fresh axios instance to avoid any default header conflicts
    const response = await axios.post(
      `${this.client.defaults.baseURL}${url}`,
      formData,
      {
        headers: {
          // Let the browser auto-set Content-Type with the correct boundary
          // Do NOT set Content-Type manually for multipart uploads
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 60000, // 60 seconds for large uploads
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )

    return response.data
  }

  async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    const response = await this.client.get(url, { params })
    return response.data
  }
}

export const api = new ApiClient()
export default api
