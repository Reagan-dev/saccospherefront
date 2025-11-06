import { useState, FormEvent } from 'react'
import apiClient from '@/lib/axios'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Sacco } from '@/types'

interface InternalJoinFormProps {
  sacco: Sacco
  onSuccess: () => void
  onCancel: () => void
}

const JOIN_SACCO_ENDPOINT = '/members/join_sacco/'

export default function InternalJoinForm({
  sacco,
  onSuccess,
  onCancel,
}: InternalJoinFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    member_number: '',
    notes: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post(
        `${JOIN_SACCO_ENDPOINT}${sacco.id}/`,
        {
          ...formData,
          sacco: sacco.id,
        }
      )

      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Success',
          description: `Successfully joined ${sacco.name}!`,
          variant: 'success',
        })
        onSuccess()
      } else {
        throw new Error('Failed to join sacco')
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to join sacco. Please try again.'
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown } }
        const responseData = axiosError.response?.data
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
            }
          }
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
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="member_number"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Member Number (Optional)
        </label>
        <input
          id="member_number"
          name="member_number"
          type="text"
          value={formData.member_number}
          onChange={handleChange}
          className={cn(
            'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
            'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
            'sm:text-sm sm:leading-6',
            error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300'
          )}
          placeholder="Enter your member number"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className={cn(
            'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
            'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
            'sm:text-sm sm:leading-6',
            error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300'
          )}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm',
            'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          )}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
              Joining...
            </span>
          ) : (
            'Confirm Join'
          )}
        </button>
      </div>
    </form>
  )
}

