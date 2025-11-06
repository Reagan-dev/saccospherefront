import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { RegisterCredentials } from '@/types'

export default function RegisterForm() {
  const { registerUser, isLoading, error, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [confirmPassword, setConfirmPassword] = useState('')

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/memberships', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setLocalError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)

    // Validation
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setLocalError('Please fill in all fields')
      return
    }

    if (formData.password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long')
      return
    }

    try {
      await registerUser(formData)
      // Show success toast
      toast({
        title: 'Success',
        description: 'Account created successfully! You have been logged in.',
        variant: 'success',
      })
      // Check if user was authenticated after registration
      // The hook will set isAuthenticated if tokens were received
      // A slight delay ensures state is updated
      setTimeout(() => {
        navigate('/dashboard/memberships', { replace: true })
      }, 100)
    } catch (err) {
      // Error is handled by the hook and displayed via error state
      // The error message is already set in the hook
    }
  }

  const displayError = error || localError

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white px-8 py-10 shadow-lg rounded-lg border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your information to get started
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {displayError && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {displayError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className={cn(
                    'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                    'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                    'sm:text-sm sm:leading-6',
                    displayError
                      ? 'ring-red-300 focus:ring-red-500'
                      : 'ring-gray-300'
                  )}
                  placeholder="John"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className={cn(
                    'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                    'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                    'sm:text-sm sm:leading-6',
                    displayError
                      ? 'ring-red-300 focus:ring-red-500'
                      : 'ring-gray-300'
                  )}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                  'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                  'sm:text-sm sm:leading-6',
                  displayError
                    ? 'ring-red-300 focus:ring-red-500'
                    : 'ring-gray-300'
                )}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={cn(
                  'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                  'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                  'sm:text-sm sm:leading-6',
                  displayError
                    ? 'ring-red-300 focus:ring-red-500'
                    : 'ring-gray-300'
                )}
                placeholder="Create a password"
              />
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                  'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                  'sm:text-sm sm:leading-6',
                  displayError
                    ? 'ring-red-300 focus:ring-red-500'
                    : 'ring-gray-300'
                )}
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex w-full justify-center rounded-md px-3 py-2.5 text-sm font-semibold text-white shadow-sm',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-primary',
                  isLoading
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-700'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
