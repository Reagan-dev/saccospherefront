import { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import type { Loan } from '@/types'

export interface ApplyForLoanData {
  amount: number
  duration_months: number
  sacco: number
}

interface UseLoansReturn {
  loans: Loan[]
  isLoading: boolean
  isError: boolean
  isApplying: boolean
  applyError: string | null
  fetchMyLoans: () => Promise<void>
  applyForLoan: (data: ApplyForLoanData) => Promise<Loan>
}

const LOANS_ENDPOINT = '/services/loans/'

/**
 * Custom hook for managing loans
 * Handles fetching user loans and applying for new loans
 */
export function useLoans(): UseLoansReturn {
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Fetch user's loans
   * GET request to the loans endpoint (requires authentication)
   */
  const fetchMyLoans = useCallback(async () => {
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
      const response = await apiClient.get<Loan[] | { results: Loan[] }>(
        LOANS_ENDPOINT,
        { signal }
      )

      // Handle different response formats
      // Could be an array directly or an object with results array (pagination)
      const loansData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results: Loan[] }).results || []

      setLoans(loansData)
      setIsError(false)
    } catch (err) {
      // Ignore abort errors
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      setIsError(true)
      setLoans([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Apply for a new loan
   * POST request to the loans endpoint (requires authentication)
   * @param data - Loan application data (amount, duration_months, sacco)
   * @returns Created loan
   */
  const applyForLoan = useCallback(
    async (data: ApplyForLoanData): Promise<Loan> => {
      setIsApplying(true)
      setApplyError(null)

      try {
        const payload = {
          amount: data.amount,
          duration_months: data.duration_months,
          sacco: data.sacco,
        }

        const response = await apiClient.post<Loan>(LOANS_ENDPOINT, payload)

        // Add the new loan to the list
        setLoans((prev) => [response.data, ...prev])
        setApplyError(null)
        return response.data
      } catch (err) {
        let errorMessage = 'Failed to apply for loan.'

        if (axios.isAxiosError(err)) {
          if (err.response) {
            // Server responded with error
            errorMessage =
              err.response.data?.message ||
              err.response.data?.error ||
              err.response.data?.detail ||
              Object.values(err.response.data || {}).flat().join(', ') ||
              `Failed to apply for loan: ${err.response.statusText}`
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'Network error. Please check your connection.'
          }
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setApplyError(errorMessage)
        throw err
      } finally {
        setIsApplying(false)
      }
    },
    []
  )

  return {
    loans,
    isLoading,
    isError,
    isApplying,
    applyError,
    fetchMyLoans,
    applyForLoan,
  }
}

