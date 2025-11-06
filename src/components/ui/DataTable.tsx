import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface Column<T> {
  id: string
  header: string | ((column: Column<T>) => React.ReactNode)
  accessorKey?: keyof T
  accessorFn?: (row: T) => React.ReactNode
  enableSorting?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: keyof T | ((row: T) => string)
  searchPlaceholder?: string
  className?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc' | null
  }>({ key: null, direction: null })

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchKey) return data

    return data.filter((row) => {
      const searchValue =
        typeof searchKey === 'function'
          ? searchKey(row)
          : String(row[searchKey] || '')
      return searchValue.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [data, searchQuery, searchKey])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData

    return [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.id === sortConfig.key)
      if (!column) return 0

      let aValue: unknown
      let bValue: unknown

      if (column.accessorFn) {
        aValue = column.accessorFn(a)
        bValue = column.accessorFn(b)
      } else if (column.accessorKey) {
        aValue = a[column.accessorKey]
        bValue = b[column.accessorKey]
      } else {
        return 0
      }

      // Convert to strings for comparison
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig, columns])

  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column || column.enableSorting === false) return

    setSortConfig((prev) => {
      if (prev.key === columnId) {
        // Cycle through: asc -> desc -> none
        if (prev.direction === 'asc') {
          return { key: columnId, direction: 'desc' }
        } else if (prev.direction === 'desc') {
          return { key: null, direction: null }
        }
      }
      return { key: columnId, direction: 'asc' }
    })
  }

  const getSortIcon = (columnId: string) => {
    if (sortConfig.key !== columnId || !sortConfig.direction) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      )
    }
    if (sortConfig.direction === 'asc') {
      return (
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      )
    }
    return (
      <svg
        className="w-4 h-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {searchKey && (
        <div className="flex items-center">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md',
                'leading-5 bg-white placeholder-gray-500 focus:outline-none',
                'focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary',
                'sm:text-sm'
              )}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.enableSorting !== false && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() =>
                    column.enableSorting !== false && handleSort(column.id)
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>
                      {typeof column.header === 'function'
                        ? column.header(column)
                        : column.header}
                    </span>
                    {column.enableSorting !== false && getSortIcon(column.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  {searchQuery
                    ? 'No results found for your search.'
                    : 'No data available.'}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.accessorFn
                        ? column.accessorFn(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey] || '')
                        : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {sortedData.length} of {data.length} result{sortedData.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  )
}
