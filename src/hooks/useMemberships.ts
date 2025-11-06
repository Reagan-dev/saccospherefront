import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import type { Membership } from '@/types'

interface UseMembershipsReturn {
  memberships: Membership[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const MEMBERSHIPS_ENDPOINT = '/members/memberships/'

/**
 * Custom hook for fetching user memberships
 * GETs the list of memberships from the API
 */
export function useMemberships(): UseMembershipsReturn {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchMemberships = useCallback(async () => {
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
      const response = await apiClient.get<Membership[] | { results: Membership[] }>(
        MEMBERSHIPS_ENDPOINT,
        { signal }
      )

      // Handle different response formats
      // Could be an array directly or an object with results array (pagination)
      const membershipsData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results: Membership[] }).results || []

      setMemberships(membershipsData)
      setError(null)
    } catch (err) {
      // Ignore abort errors
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      let errorMessage = 'Failed to fetch memberships.'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            `Failed to fetch memberships: ${err.response.statusText}`
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setMemberships([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch memberships on mount
  useEffect(() => {
    fetchMemberships()

    // Cleanup function to cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchMemberships])

  return {
    memberships,
    isLoading,
    error,
    refetch: fetchMemberships,
  }
}
