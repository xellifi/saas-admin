import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthResponse } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>
  register: (data: { email: string; password: string; role?: string; firstName?: string; lastName?: string }) => Promise<AuthResponse>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Login failed')
          }

          // Simple backend returns data directly, not wrapped in data.success
          const authData = {
            user: data.user,
            accessToken: data.token,
            refreshToken: data.refreshToken,
          }

          set({
            user: authData.user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          localStorage.setItem('accessToken', authData.accessToken)
          localStorage.setItem('refreshToken', authData.refreshToken)

          return authData
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Registration failed')
          }

          const authData: AuthResponse = result.data

          set({
            user: authData.user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          localStorage.setItem('accessToken', authData.accessToken)
          localStorage.setItem('refreshToken', authData.refreshToken)

          return authData
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get()
        if (!currentRefreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Token refresh failed')
          }

          const { accessToken } = data.data

          set({ accessToken })
          localStorage.setItem('accessToken', accessToken)
        } catch (error) {
          get().logout()
          throw error
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
