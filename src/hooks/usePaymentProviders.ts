import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import type { PaymentProvider } from '@/types'

interface UsePaymentProvidersReturn {
  providers: PaymentProvider[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PROVIDERS_ENDPOINT = '/payments/providers/'

/**
 * Custom hook for fetching payment providers
 * GETs the list of payment providers from the API
 */
export function usePaymentProviders(): UsePaymentProvidersReturn {
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchProviders = useCallback(async () => {
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
      const response = await apiClient.get<
        PaymentProvider[] | { results: PaymentProvider[] }
      >(PROVIDERS_ENDPOINT, { signal })

      // Handle different response formats
      // Could be an array directly or an object with results array (pagination)
      const providersData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results: PaymentProvider[] }).results || []

      setProviders(providersData)
      setError(null)
    } catch (err) {
      // Ignore abort errors
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      let errorMessage = 'Failed to fetch payment providers.'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            `Failed to fetch providers: ${err.response.statusText}`
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setProviders([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch providers on mount
  useEffect(() => {
    fetchProviders()

    // Cleanup function to cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchProviders])

  return {
    providers,
    isLoading,
    error,
    refetch: fetchProviders,
  }
}
