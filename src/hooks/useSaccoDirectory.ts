import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import type { Sacco } from '@/types'

interface UseSaccoDirectoryReturn {
  saccos: Sacco[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const SACCOS_ENDPOINT = '/accounts/saccos/'

/**
 * Custom hook for fetching the sacco directory
 * GETs the list of saccos from the API
 */
export function useSaccoDirectory(): UseSaccoDirectoryReturn {
  const [saccos, setSaccos] = useState<Sacco[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchSaccos = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<Sacco[] | { results: Sacco[] }>(
        SACCOS_ENDPOINT,
        { signal }
      )

      // Handle different response formats
      // Could be an array directly or an object with results array (pagination)
      const saccosData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results: Sacco[] }).results || []

      setSaccos(saccosData)
      setError(null)
    } catch (err) {
      // Ignore abort errors
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      let errorMessage = 'Failed to fetch sacco directory.'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            `Failed to fetch saccos: ${err.response.statusText}`
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setSaccos([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch saccos on mount
  useEffect(() => {
    fetchSaccos()

    // Cleanup function to cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchSaccos])

  return {
    saccos,
    isLoading,
    error,
    refetch: fetchSaccos,
  }
}
