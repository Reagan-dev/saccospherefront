import { useState, useCallback } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import { useToast } from '@/components/ui/Toast'
import type { Profile } from '@/types'

export interface ProfileData {
  phone_number: string
  bio: string
}

interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  isUpdating: boolean
  isCreating: boolean
  error: string | null
  updateError: string | null
  createError: string | null
  fetchProfile: () => Promise<void>
  updateProfile: (data: ProfileData) => Promise<Profile>
  createProfile: (data: ProfileData) => Promise<Profile>
}

const PROFILES_ENDPOINT = '/accounts/profiles/'

/**
 * Custom hook for managing user profile
 * Handles fetching, updating, and creating user profiles
 */
export function useProfile(): UseProfileReturn {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  /**
   * Fetch user profile
   */
  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<Profile>(PROFILES_ENDPOINT)

      setProfile(response.data)
      setError(null)
    } catch (err) {
      let errorMessage = 'Failed to fetch profile.'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // 404 means profile doesn't exist yet, which is okay
          if (err.response.status === 404) {
            setProfile(null)
            setError(null)
            return
          }

          // Server responded with error
          errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            err.response.data?.detail ||
            `Failed to fetch profile: ${err.response.statusText}`
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Update user profile
   * @param data - Profile data (phone_number, bio)
   * @returns Updated profile
   */
  const updateProfile = useCallback(
    async (data: ProfileData): Promise<Profile> => {
      setIsUpdating(true)
      setUpdateError(null)

      try {
        const payload = {
          phone_number: data.phone_number,
          bio: data.bio,
        }

        const response = await apiClient.put<Profile>(PROFILES_ENDPOINT, payload)

        setProfile(response.data)
        setUpdateError(null)
        
        // Show success toast
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          variant: 'success',
        })
        
        return response.data
      } catch (err) {
        let errorMessage = 'Failed to update profile.'

        if (axios.isAxiosError(err)) {
          if (err.response) {
            const responseData = err.response.data
            
            // Handle validation errors - extract specific field errors
            if (responseData?.phone_number) {
              // Handle phone number validation errors
              errorMessage = Array.isArray(responseData.phone_number)
                ? responseData.phone_number[0]
                : responseData.phone_number
            } else if (responseData?.bio) {
              // Handle bio validation errors
              errorMessage = Array.isArray(responseData.bio)
                ? responseData.bio[0]
                : responseData.bio
            } else if (responseData?.non_field_errors) {
              // Handle Django REST framework non_field_errors
              errorMessage = Array.isArray(responseData.non_field_errors)
                ? responseData.non_field_errors[0]
                : responseData.non_field_errors
            } else if (responseData?.detail) {
              errorMessage = responseData.detail
            } else if (responseData?.message) {
              errorMessage = responseData.message
            } else if (responseData?.error) {
              errorMessage = responseData.error
            } else if (typeof responseData === 'string') {
              errorMessage = responseData
            } else {
              // Try to extract any validation errors from the response
              const validationErrors = Object.entries(responseData || {})
                .map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return `${key}: ${value[0]}`
                  }
                  return `${key}: ${value}`
                })
                .join(', ')
              
              if (validationErrors) {
                errorMessage = validationErrors
              } else {
                errorMessage = `Failed to update profile: ${err.response.statusText || 'Unknown error'}`
              }
            }
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'Network error. Please check your connection.'
          }
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setUpdateError(errorMessage)
        
        // Show error toast for validation errors
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'error',
        })
        
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [toast]
  )

  /**
   * Create user profile
   * @param data - Profile data (phone_number, bio)
   * @returns Created profile
   */
  const createProfile = useCallback(
    async (data: ProfileData): Promise<Profile> => {
      setIsCreating(true)
      setCreateError(null)

      try {
        const payload = {
          phone_number: data.phone_number,
          bio: data.bio,
        }

        const response = await apiClient.post<Profile>(
          PROFILES_ENDPOINT,
          payload
        )

        setProfile(response.data)
        setCreateError(null)
        return response.data
      } catch (err) {
        let errorMessage = 'Failed to create profile.'

        if (axios.isAxiosError(err)) {
          if (err.response) {
            // Server responded with error
            errorMessage =
              err.response.data?.message ||
              err.response.data?.error ||
              err.response.data?.detail ||
              Object.values(err.response.data || {}).flat().join(', ') ||
              `Failed to create profile: ${err.response.statusText}`
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'Network error. Please check your connection.'
          }
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setCreateError(errorMessage)
        throw err
      } finally {
        setIsCreating(false)
      }
    },
    []
  )

  return {
    profile,
    isLoading,
    isUpdating,
    isCreating,
    error,
    updateError,
    createError,
    fetchProfile,
    updateProfile,
    createProfile,
  }
}

