export interface Client {
  id: string
  name: string
  phone: string
  address: string
  cedula: string
  email?: string
  collectorId: string
  createdAt: string
  status: 'active' | 'inactive'
}

export interface Collector {
  id: string
  name: string
  phone: string
  email: string
  password: string
  cedula: string
  zone: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  password: string
  role: 'admin'
  createdAt: string
}

export interface AuthSession {
  userId: string
  userType: 'admin' | 'collector'
  email: string
  name: string
}

export interface Loan {
  id: string
  clientId: string
  collectorId: string
  amount: number
  interestRate: number
  totalAmount: number
  paidAmount: number
  installments: number
  paidInstallments: number
  installmentAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'defaulted'
  createdAt: string
}

export interface Payment {
  id: string
  loanId: string
  clientId: string
  collectorId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
}

export interface Visit {
  id: string
  clientId: string
  collectorId: string
  loanId: string
  scheduledDate: string
  status: 'pending' | 'completed' | 'missed'
  notes?: string
  createdAt: string
}

export interface InventoryItem {
  id: string
  collectorId: string
  itemType: 'tablet' | 'phone' | 'motorcycle' | 'cash' | 'documents' | 'other'
  description: string
  serialNumber?: string
  assignedDate: string
  status: 'assigned' | 'returned' | 'lost'
  notes?: string
}

export type ViewMode = 'office' | 'collector'
