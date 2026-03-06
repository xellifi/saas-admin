import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react'

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be exactly 6 digits')
})

type OTPFormData = z.infer<typeof otpSchema>

const VerifyOTP: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [resendEnabled, setResendEnabled] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema)
  })

  React.useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setResendEnabled(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  const onSubmit = async (data: OTPFormData) => {
    try {
      setIsLoading(true)
      setError('')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTimeLeft(300)
      setResendEnabled(false)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Email verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div className="mt-6">
              <Link 
                to="/login" 
                className="btn btn-primary btn-md"
              >
                Continue to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link 
            to="/forgot-password" 
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div className="text-center mt-6">
            <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Verify your email
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to {email}
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter verification code
            </label>
            <div className="mt-1">
              <input
                {...register('code')}
                id="code"
                type="text"
                maxLength={6}
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                style={{ letterSpacing: '0.5em' }}
              />
            </div>
            {errors.code && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {timeLeft > 0 ? (
                <>Code expires in <span className="font-medium">{formatTime(timeLeft)}</span></>
              ) : (
                <>Code has expired. Please request a new one.</>
              )}
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="btn btn-primary btn-md w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify code'}
            </button>
          </div>

          {resendEnabled && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="btn btn-outline btn-sm"
              >
                {isLoading ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default VerifyOTP
