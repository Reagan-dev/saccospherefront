import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { ToastProvider } from '@/components/ui/Toast'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import MembershipsPage from '@/pages/MembershipsPage'
import BrowseSaccosPage from '@/pages/BrowseSaccosPage'
import ServicesPage from '@/pages/ServicesPage'
import TransactionsPage from '@/pages/TransactionsPage'
import AccountProfilePage from '@/pages/AccountProfilePage'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <ToastProvider>
      <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? '/dashboard/memberships' : '/login'}
              replace
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="memberships" replace />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="saccos" element={<BrowseSaccosPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="profile" element={<AccountProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

export default App
