import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { LoginCredentials, RegisterCredentials, LoginResponse } from '@/types'

interface ChangePasswordData {
  old_password: string
  new_password: string
  confirm_password: string
}

interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<void>
  registerUser: (data: RegisterCredentials) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  isChangingPassword: boolean
  error: string | null
  passwordChangeError: string | null
  token: string | null
}

const API_BASE_URL = 'https://saccosphere-atze.onrender.com/api'
const LOGIN_ENDPOINT = `${API_BASE_URL}/accounts/login/`
const REGISTER_ENDPOINT = `${API_BASE_URL}/accounts/register/`
const CHANGE_PASSWORD_ENDPOINT = `${API_BASE_URL}/accounts/change-password/`

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

/**
 * Custom hook for authentication
 * Handles login, logout, and authentication state management
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
  }, [])

  /**
   * Login function that authenticates user and saves JWT tokens
   * @param credentials - User email and password
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<LoginResponse>(
        LOGIN_ENDPOINT,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      // Extract token from response (handles different response formats)
      const accessToken =
        response.data.access ||
        response.data.token ||
        response.data.tokens?.access

      const refreshToken =
        response.data.refresh || response.data.tokens?.refresh

      if (!accessToken) {
        throw new Error('No access token received from server')
      }

      // Save tokens to localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      }

      // Update state
      setToken(accessToken)
      setIsAuthenticated(true)
      setError(null)
    } catch (err) {
      let errorMessage = 'Invalid credentials'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error - extract specific error message
          const responseData = err.response.data
          
          // Handle different error response formats
          if (responseData?.detail) {
            errorMessage = responseData.detail
          } else if (responseData?.message) {
            errorMessage = responseData.message
          } else if (responseData?.error) {
            errorMessage = responseData.error
          } else if (responseData?.non_field_errors) {
            // Handle Django REST framework non_field_errors
            errorMessage = Array.isArray(responseData.non_field_errors)
              ? responseData.non_field_errors[0]
              : responseData.non_field_errors
          } else if (typeof responseData === 'string') {
            errorMessage = responseData
          } else if (responseData?.email) {
            // Handle email-specific errors
            errorMessage = Array.isArray(responseData.email)
              ? responseData.email[0]
              : responseData.email
          } else if (responseData?.password) {
            // Handle password-specific errors
            errorMessage = Array.isArray(responseData.password)
              ? responseData.password[0]
              : responseData.password
          } else if (err.response.status === 401) {
            errorMessage = 'Invalid credentials'
          } else if (err.response.status === 400) {
            errorMessage = 'Invalid request. Please check your credentials.'
          } else {
            errorMessage = `Login failed: ${err.response.statusText || 'Unknown error'}`
          }
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        } else {
          errorMessage = 'An error occurred. Please try again.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsAuthenticated(false)
      setToken(null)

      // Clear any existing tokens on error
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)

      // Create a new error with the specific message
      const loginError = new Error(errorMessage)
      throw loginError
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Register function that creates a new user account
   * @param data - User registration data (email, password, first_name, last_name)
   */
  const registerUser = useCallback(async (data: RegisterCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<LoginResponse>(
        REGISTER_ENDPOINT,
        {
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      // Extract token from response (handles different response formats)
      const accessToken =
        response.data.access ||
        response.data.token ||
        response.data.tokens?.access

      const refreshToken =
        response.data.refresh || response.data.tokens?.refresh

      // If tokens are received, save them and authenticate user
      if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        }
        setToken(accessToken)
        setIsAuthenticated(true)
      }

      setError(null)
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            err.response.data?.email?.[0] ||
            err.response.data?.password?.[0] ||
            `Registration failed: ${err.response.statusText}`
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsAuthenticated(false)
      setToken(null)

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Change password function
   * @param data - Password change data (old_password, new_password, confirm_password)
   */
  const changePassword = useCallback(
    async (data: ChangePasswordData) => {
      setIsChangingPassword(true)
      setPasswordChangeError(null)

      // Client-side validation
      if (data.new_password !== data.confirm_password) {
        setPasswordChangeError('New passwords do not match')
        setIsChangingPassword(false)
        throw new Error('New passwords do not match')
      }

      if (data.new_password.length < 6) {
        setPasswordChangeError('New password must be at least 6 characters long')
        setIsChangingPassword(false)
        throw new Error('New password must be at least 6 characters long')
      }

      try {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY)
        if (!token) {
          throw new Error('You must be logged in to change your password')
        }

        const response = await axios.post(
          CHANGE_PASSWORD_ENDPOINT,
          {
            old_password: data.old_password,
            new_password: data.new_password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setPasswordChangeError(null)
      } catch (err) {
        let errorMessage = 'Failed to change password. Please try again.'

        if (axios.isAxiosError(err)) {
          if (err.response) {
            // Server responded with error
            errorMessage =
              err.response.data?.message ||
              err.response.data?.error ||
              err.response.data?.detail ||
              err.response.data?.old_password?.[0] ||
              err.response.data?.new_password?.[0] ||
              Object.values(err.response.data || {}).flat().join(', ') ||
              `Password change failed: ${err.response.statusText}`
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'Network error. Please check your connection.'
          }
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setPasswordChangeError(errorMessage)
        throw err
      } finally {
        setIsChangingPassword(false)
      }
    },
    []
  )

  /**
   * Logout function that clears authentication state and tokens
   */
  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    setToken(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  return {
    login,
    registerUser,
    changePassword,
    logout,
    isAuthenticated,
    isLoading,
    isChangingPassword,
    error,
    passwordChangeError,
    token,
  }
}
