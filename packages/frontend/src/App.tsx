import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { queryClient } from './main'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoadingSpinner from '@/components/LoadingSpinner'
import ToastProvider from '@/components/ui/Toast'
import ConfirmDialogProvider from '@/contexts/ConfirmDialogContext'

// Lazy load pages
const Login = React.lazy(() => import('@/pages/auth/Login'))
const Register = React.lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = React.lazy(() => import('@/pages/auth/ForgotPassword'))
const VerifyOTP = React.lazy(() => import('@/pages/auth/VerifyOTP'))

const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Users = React.lazy(() => import('@/pages/Users'))
const Plans = React.lazy(() => import('@/pages/Plans'))
const Support = React.lazy(() => import('@/pages/Support'))
const TicketDetail = React.lazy(() => import('@/pages/support/TicketDetail'))
const Addons = React.lazy(() => import('@/pages/Addons'))
const AddonContent = React.lazy(() => import('@/pages/AddonContent'))
const Settings = React.lazy(() => import('@/pages/Settings'))
const Profile = React.lazy(() => import('@/pages/Profile'))
const RolesPermissions = React.lazy(() => import('@/pages/RolesPermissions'))
// @ts-ignore
const Storefront = React.lazy(() => import('../../../addons/Online-Store/src/public/Storefront.jsx'))

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ConfirmDialogProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                  }
                />
                <Route
                  path="/register"
                  element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
                  }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin', 'user']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin']}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="plans"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin']}>
                        <Plans />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="support"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin', 'user']}>
                        <Support />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="support/:id"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin', 'user']}>
                        <TicketDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="addons"
                    element={
                      <ProtectedRoute roles={['superadmin']}>
                        <Addons />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="addon/*"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin', 'user']}>
                        <AddonContent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="roles-permissions"
                    element={
                      <ProtectedRoute roles={['superadmin']}>
                        <RolesPermissions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin']}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile/:id"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin', 'user']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute roles={['superadmin', 'admin', 'user']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route path="/s/:slug" element={<Storefront />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </QueryClientProvider>
      </ToastProvider>
    </ConfirmDialogProvider>
  )
}

export default App
