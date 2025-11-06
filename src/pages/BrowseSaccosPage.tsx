import { useState } from 'react'
import { useSaccoDirectory } from '@/hooks/useSaccoDirectory'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/Dialog'
import InternalJoinForm from '@/components/InternalJoinForm'
import type { Sacco } from '@/types'

export default function BrowseSaccosPage() {
  const { saccos, isLoading, error, refetch } = useSaccoDirectory()
  const [selectedSacco, setSelectedSacco] = useState<Sacco | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleJoinSacco = (sacco: Sacco) => {
    if (!sacco.is_internal) {
      // External sacco - redirect to website
      if (sacco.website_url) {
        window.open(sacco.website_url, '_blank', 'noopener,noreferrer')
      }
    } else {
      // Internal sacco - open dialog
      setSelectedSacco(sacco)
      setIsDialogOpen(true)
    }
  }

  const handleJoinSuccess = () => {
    setIsDialogOpen(false)
    setSelectedSacco(null)
    // Optionally refetch saccos to update UI
    refetch()
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedSacco(null)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Browse Saccos
        </h1>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="mt-auto pt-4 space-y-2">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {saccos.length === 0 ? (
              <p className="text-gray-600">No saccos available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saccos.map((sacco) => (
                  <div
                    key={sacco.id}
                    className={cn(
                      'border rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col',
                      sacco.is_internal
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sacco.name}
                      </h3>
                      {sacco.is_internal && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800">
                          Internal
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 space-y-2">
                      {sacco.website_url && !sacco.is_internal && (
                        <a
                          href={sacco.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-primary hover:text-primary-700 hover:underline"
                        >
                          Visit Website →
                        </a>
                      )}
                      <button
                        onClick={() => handleJoinSacco(sacco)}
                        className={cn(
                          'w-full px-4 py-2 text-sm font-medium rounded-md transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                          sacco.is_internal
                            ? 'bg-primary text-white hover:bg-primary-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        )}
                      >
                        {sacco.is_internal ? 'Join Sacco' : 'Visit Website'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Join Sacco Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogClose onClose={handleDialogClose} />
          <DialogHeader>
            <DialogTitle>Join {selectedSacco?.name}</DialogTitle>
            <DialogDescription>
              Complete the form below to join this internal sacco.
            </DialogDescription>
          </DialogHeader>
          {selectedSacco && (
            <InternalJoinForm
              sacco={selectedSacco}
              onSuccess={handleJoinSuccess}
              onCancel={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
