import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import apiClient from '@/lib/axios'
import type { Transaction } from '@/types'

export interface CreateTransactionData {
  provider: string
  amount: number
  reference: string
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  isCreating: boolean
  createError: string | null
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>
  fetchMyTransactions: () => Promise<void>
  refetch: () => Promise<void>
}

const TRANSACTIONS_ENDPOINT = '/payments/transactions/'

/**
 * Custom hook for managing transactions
 * Handles creating transactions and fetching transaction history
 */
export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Fetch transaction history
   */
  const fetchMyTransactions = useCallback(async () => {
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
        Transaction[] | { results: Transaction[] }
      >(TRANSACTIONS_ENDPOINT, { signal })

      // Handle different response formats
      // Could be an array directly or an object with results array (pagination)
      const transactionsData = Array.isArray(response.data)
        ? response.data
        : (response.data as { results: Transaction[] }).results || []

      setTransactions(transactionsData)
      setError(null)
    } catch (err) {
      // Ignore abort errors
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      let errorMessage = 'Failed to fetch transactions.'

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            `Failed to fetch transactions: ${err.response.statusText}`
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Create a new transaction
   * @param data - Transaction data (provider, amount, reference)
   * @returns Created transaction
   */
  const createTransaction = useCallback(
    async (data: CreateTransactionData): Promise<Transaction> => {
      setIsCreating(true)
      setCreateError(null)

      try {
        const payload = {
          provider: data.provider,
          amount: data.amount,
          reference: data.reference,
        }

        const response = await apiClient.post<Transaction>(
          TRANSACTIONS_ENDPOINT,
          payload
        )

        // Add the new transaction to the list
        setTransactions((prev) => [response.data, ...prev])
        setCreateError(null)
        return response.data
      } catch (err) {
        let errorMessage = 'Failed to create transaction.'

        if (axios.isAxiosError(err)) {
          if (err.response) {
            // Server responded with error
            errorMessage =
              err.response.data?.message ||
              err.response.data?.error ||
              err.response.data?.detail ||
              Object.values(err.response.data || {}).flat().join(', ') ||
              `Failed to create transaction: ${err.response.statusText}`
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

  // Fetch transactions on mount
  useEffect(() => {
    fetchMyTransactions()

    // Cleanup function to cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchMyTransactions])

  return {
    transactions,
    isLoading,
    error,
    isCreating,
    createError,
    createTransaction,
    fetchMyTransactions,
    refetch: fetchMyTransactions,
  }
}
