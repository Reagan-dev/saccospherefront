import { useState, useEffect } from 'react'
import apiClient from '../lib/axios'

interface UseApiOptions {
  immediate?: boolean
}

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiClient.get<T>(url)
      setState({
        data: response.data,
        loading: false,
        error: null,
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
    }
  }

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return {
    ...state,
    refetch: execute,
  }
}
