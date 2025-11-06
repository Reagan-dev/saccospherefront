import { useMemberships } from '@/hooks/useMemberships'
import DataTable from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { Membership, Sacco, User } from '@/types'

export default function MembershipsPage() {
  const { memberships, isLoading, error, refetch } = useMemberships()

  // Helper function to get sacco name
  const getSaccoName = (membership: Membership): string => {
    if (typeof membership.sacco === 'string') {
      return membership.sacco
    }
    return (membership.sacco as Sacco).name || 'Unknown Sacco'
  }

  // Helper function to get user name (usually current user)
  const getUserName = (membership: Membership): string => {
    if (typeof membership.user === 'string') {
      return membership.user
    }
    const user = membership.user as User
    return user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email || 'Unknown User'
  }

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const columns = [
    {
      id: 'sacco',
      header: 'Sacco Name',
      accessorFn: (membership: Membership) => (
        <span className="font-medium text-gray-900">
          {getSaccoName(membership)}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role' as keyof Membership,
      accessorFn: (membership: Membership) => (
        <span className={cn(
          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
          membership.role === 'admin' || membership.role === 'Admin'
            ? 'bg-purple-100 text-purple-800'
            : membership.role === 'member' || membership.role === 'Member'
            ? 'bg-primary-100 text-primary-800'
            : 'bg-gray-100 text-gray-800'
        )}>
          {membership.role || 'Member'}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (membership: Membership) => (
        <span className={cn(
          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
          membership.is_active !== false
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        )}>
          {membership.is_active !== false ? 'Active' : 'Inactive'}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'joined_at',
      header: 'Joined Date',
      accessorFn: (membership: Membership) => (
        <span className="text-gray-600">{formatDate(membership.joined_at)}</span>
      ),
      enableSorting: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            My Memberships
          </h1>
          <p className="text-gray-600">
            View and manage your Sacco memberships here.
          </p>
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
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 py-3 border-b border-gray-100">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
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
                onClick={() => refetch()}
                className="text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && memberships.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Memberships Found
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              You don't have any Sacco memberships yet. Browse available Saccos to join one and get started.
            </p>
          </div>
        )}

        {!isLoading && !error && memberships.length > 0 && (
          <DataTable
            data={memberships}
            columns={columns}
            searchKey={(membership: Membership) => getSaccoName(membership)}
            searchPlaceholder="Search by sacco name..."
          />
        )}
      </div>
    </div>
  )
}
