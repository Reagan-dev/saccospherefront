// Common types for the application
// Export your types here

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface LoginResponse {
  access?: string
  refresh?: string
  token?: string
  tokens?: {
    access?: string
    refresh?: string
  }
  user?: {
    id: string
    email: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

// User type
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active?: boolean
  date_joined?: string
  last_login?: string
  [key: string]: unknown
}

// Profile type
export interface Profile {
  id: string
  user: string | User
  phone_number?: string
  bio?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

// Sacco type
export interface Sacco {
  id: string
  name: string
  website_url: string
  is_internal: boolean
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

// Membership type
export interface Membership {
  id: string
  user: string | User
  sacco: string | Sacco
  role?: string
  is_active?: boolean
  joined_at?: string
  [key: string]: unknown
}

// Payment Provider type
export interface PaymentProvider {
  id: string
  name: string
  code?: string
  is_active?: boolean
  [key: string]: unknown
}

// Transaction type
export interface Transaction {
  id: string
  provider: string | PaymentProvider
  amount: number
  reference: string
  status?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

// Service type
export interface Service {
  id: string
  name: string
  description?: string
  service_type?: string
  is_active?: boolean
  [key: string]: unknown
}

// Savings Transaction type
export interface SavingsTransaction {
  id: string
  amount: number
  service: string | Service
  transaction_type: 'deposit' | 'withdrawal'
  status?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

// Loan type
export interface Loan {
  id: string
  amount: number
  duration_months: number
  sacco: string | number | Sacco
  status?: string
  interest_rate?: number
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}
