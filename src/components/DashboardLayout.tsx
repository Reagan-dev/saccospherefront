import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  path: string
  icon?: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'My Memberships',
    path: '/dashboard/memberships',
  },
  {
    label: 'Browse Saccos',
    path: '/dashboard/saccos',
  },
  {
    label: 'Services',
    path: '/dashboard/services',
  },
  {
    label: 'Transactions',
    path: '/dashboard/transactions',
  },
  {
    label: 'Account Profile',
    path: '/dashboard/profile',
  },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">SaccoSphere</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button - Prominently Featured */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg',
                'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2',
                'focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm',
                'hover:shadow-md active:bg-red-800'
              )}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
