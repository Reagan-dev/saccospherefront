import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import DataTable from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, cn } from '@/lib/utils'
import type { Transaction, PaymentProvider } from '@/types'

export default function TransactionsPage() {
  const { transactions, isLoading, error, fetchMyTransactions } = useTransactions()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Helper function to get provider name
  const getProviderName = (transaction: Transaction): string => {
    if (typeof transaction.provider === 'string') {
      return transaction.provider
    }
    return (transaction.provider as PaymentProvider).name || 'Unknown Provider'
  }

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Filter transactions by status
  const filteredTransactions = useMemo(() => {
    if (statusFilter === 'all') return transactions
    return transactions.filter((tx) => {
      const status = (tx.status || '').toLowerCase()
      return status === statusFilter.toLowerCase()
    })
  }, [transactions, statusFilter])

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>()
    transactions.forEach((tx) => {
      if (tx.status) {
        statuses.add(tx.status.toLowerCase())
      }
    })
    return Array.from(statuses).sort()
  }, [transactions])

  const columns = [
    {
      id: 'reference',
      header: 'Reference',
      accessorFn: (transaction: Transaction) => (
        <span className="font-mono text-sm text-gray-900">
          {transaction.reference || 'N/A'}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'provider',
      header: 'Provider',
      accessorFn: (transaction: Transaction) => (
        <span className="text-gray-900">{getProviderName(transaction)}</span>
      ),
      enableSorting: true,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorFn: (transaction: Transaction) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(transaction.amount, { showSymbol: true })}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (transaction: Transaction) => {
        const status = (transaction.status || 'pending').toLowerCase()
        const statusColors: Record<string, { bg: string; text: string }> = {
          completed: { bg: 'bg-green-100', text: 'text-green-800' },
          success: { bg: 'bg-green-100', text: 'text-green-800' },
          pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
          processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
          failed: { bg: 'bg-red-100', text: 'text-red-800' },
          cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
        }
        const colors = statusColors[status] || statusColors.pending
        return (
          <span
            className={cn(
              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
              colors.bg,
              colors.text
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'created_at',
      header: 'Date',
      accessorFn: (transaction: Transaction) => (
        <span className="text-gray-600 text-sm">{formatDate(transaction.created_at)}</span>
      ),
      enableSorting: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Transaction History
              </h1>
              <p className="text-gray-600">
                View and manage your payment transaction history.
              </p>
            </div>
            <button
              onClick={() => fetchMyTransactions()}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                'text-gray-700 bg-white border border-gray-300',
                'hover:bg-gray-50 focus:outline-none focus:ring-2',
                'focus:ring-offset-2 focus:ring-primary',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Status Filter */}
          {uniqueStatuses.length > 0 && (
            <div className="mb-4 flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Filter by status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  'px-3 py-1.5 text-sm border border-gray-300 rounded-md',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                  'bg-white text-gray-900'
                )}
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              {statusFilter !== 'all' && (
                <span className="text-sm text-gray-500">
                  ({filteredTransactions.length} transaction
                  {filteredTransactions.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {/* Search skeleton */}
            <div className="max-w-sm">
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Table skeleton */}
            <div className="space-y-3">
              <div className="flex space-x-4 pb-3 border-b border-gray-200">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 py-3 border-b border-gray-100">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
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
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => fetchMyTransactions()}
                className="text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <DataTable
            data={filteredTransactions}
            columns={columns}
            searchKey={(transaction: Transaction) =>
              `${transaction.reference} ${getProviderName(transaction)}`
            }
            searchPlaceholder="Search by reference or provider..."
          />
        )}
      </div>
    </div>
  )
}
