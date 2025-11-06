import { useState } from 'react'
import { useServices } from '@/hooks/useServices'
import SavingsTransactionForm from '@/components/SavingsTransactionForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { SavingsTransaction } from '@/types'

export default function ServicesPage() {
  const { services, isLoading, isError } = useServices()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleTransactionSuccess = (transaction: SavingsTransaction) => {
    setShowTransactionForm(false)
    setSuccessMessage(
      `${
        transaction.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'
      } of KES ${transaction.amount.toLocaleString()} processed successfully!`
    )
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Services</h1>
            <p className="text-gray-600">
              Access and manage available services here.
            </p>
          </div>
          <button
            onClick={() => setShowTransactionForm(!showTransactionForm)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md text-white',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
              showTransactionForm
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-primary hover:bg-primary-700'
            )}
          >
            {showTransactionForm ? 'Cancel' : 'New Transaction'}
          </button>
        </div>

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {showTransactionForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              New Deposit/Withdrawal
            </h2>
            <SavingsTransactionForm
              services={services}
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowTransactionForm(false)}
            />
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-4">
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
                <p className="text-sm font-medium text-red-800">
                  Failed to load services. Please refresh the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-gray-600">No services available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      {service.is_active !== false && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {service.description}
                      </p>
                    )}
                    {service.service_type && (
                      <p className="text-xs text-gray-500">
                        Type: {service.service_type}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
