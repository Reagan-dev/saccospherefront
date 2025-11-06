import { useState, FormEvent } from 'react'
import apiClient from '@/lib/axios'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Service, SavingsTransaction } from '@/types'

interface SavingsTransactionFormProps {
  services: Service[]
  onSuccess?: (transaction: SavingsTransaction) => void
  onCancel?: () => void
}

interface SavingsTransactionData {
  amount: number
  service: string
  transaction_type: 'deposit' | 'withdrawal'
}

const SAVINGS_ENDPOINT = '/services/savings/'

export default function SavingsTransactionForm({
  services,
  onSuccess,
  onCancel,
}: SavingsTransactionFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SavingsTransactionData>({
    amount: 0,
    service: '',
    transaction_type: 'deposit',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'amount' ? parseFloat(value) || 0 : name === 'transaction_type' ? value as 'deposit' | 'withdrawal' : value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!formData.service) {
      setError('Please select a service')
      setIsLoading(false)
      return
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        amount: formData.amount,
        service: formData.service,
        transaction_type: formData.transaction_type,
      }

      const response = await apiClient.post<SavingsTransaction>(
        SAVINGS_ENDPOINT,
        payload
      )

      // Success
      toast({
        title: 'Success',
        description: `${
          formData.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'
        } of KES ${formData.amount.toLocaleString()} processed successfully!`,
        variant: 'success',
      })

      if (onSuccess) {
        onSuccess(response.data)
      }

      // Reset form
      setFormData({
        amount: 0,
        service: '',
        transaction_type: 'deposit',
      })
    } catch (err: unknown) {
      let errorMessage = 'Failed to process transaction. Please try again.'

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as {
          response?: { data?: unknown; statusText?: string }
          request?: unknown
        }
        if (axiosError.response) {
          const responseData = axiosError.response.data
          if (responseData && typeof responseData === 'object') {
            if ('message' in responseData) {
              errorMessage = String(responseData.message)
            } else if ('error' in responseData) {
              errorMessage = String(responseData.error)
            } else if ('detail' in responseData) {
              errorMessage = String(responseData.detail)
            } else {
              const errorValues = Object.values(responseData).flat()
              if (errorValues.length > 0) {
                errorMessage = errorValues.map(String).join(', ')
              } else {
                errorMessage = `Transaction failed: ${axiosError.response.statusText || 'Unknown error'}`
              }
            }
          }
        } else if (axiosError.request) {
          errorMessage = 'Network error. Please check your connection.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
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
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="transaction_type"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Transaction Type
        </label>
        <select
          id="transaction_type"
          name="transaction_type"
          value={formData.transaction_type}
          onChange={handleChange}
          required
          className={cn(
            'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
            'focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6',
            error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300'
          )}
        >
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="service"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Service <span className="text-red-500">*</span>
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          className={cn(
            'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
            'focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6',
            error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300'
          )}
        >
          <option value="">Select a service...</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
              {service.description && ` - ${service.description}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Amount (KES) <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          value={formData.amount || ''}
          onChange={handleChange}
          required
          placeholder="0.00"
          className={cn(
            'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
            'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
            'sm:text-sm sm:leading-6',
            error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300'
          )}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 focus:outline-none focus:ring-2',
              'focus:ring-offset-2 focus:ring-primary',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md text-white',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
            isLoading
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-700'
          )}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Processing...
            </span>
          ) : (
            `Submit ${formData.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'}`
          )}
        </button>
      </div>
    </form>
  )
}
