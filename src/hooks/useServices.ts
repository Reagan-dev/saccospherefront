import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import type { Service } from '@/types'

interface UseServicesReturn {
  services: Service[]
  isLoading: boolean
  isError: boolean
}

const SERVICES_ENDPOINT = '/services/services/'

/**
 * Custom hook for fetching services
 * GETs the list of services from the API (does not require authentication)
 */
export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchServices = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsLoading(true)
    setIsError(false)

    try {
      const response = await apiClient.get<Service[] | { results: Service[] }>(
        SERVICES_ENDPOINT,
        { signal }
      )

      // Handle different response formats
      // Could be an array directly or an object with results array (pagination)
      const servicesData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results: Service[] }).results || []

      setServices(servicesData)
      setIsError(false)
    } catch (err) {
      // Ignore abort errors
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      setIsError(true)
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch services on mount
  useEffect(() => {
    fetchServices()

    // Cleanup function to cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchServices])

  return {
    services,
    isLoading,
    isError,
  }
}
