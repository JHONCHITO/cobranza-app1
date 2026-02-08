'use client'

import { Client, Collector, Loan, Payment, Visit, InventoryItem, AdminUser, AuthSession } from './types'

const STORAGE_KEYS = {
  clients: 'gota_clients',
  collectors: 'gota_collectors',
  loans: 'gota_loans',
  payments: 'gota_payments',
  visits: 'gota_visits',
  inventory: 'gota_inventory',
  admins: 'gota_admins',
  session: 'gota_session',
}

function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Admin Users
export function getAdmins(): AdminUser[] {
  return getFromStorage<AdminUser>(STORAGE_KEYS.admins, [])
}

export function saveAdmin(admin: AdminUser): void {
  const admins = getAdmins()
  const index = admins.findIndex(a => a.id === admin.id)
  if (index >= 0) {
    admins[index] = admin
  } else {
    admins.push(admin)
  }
  saveToStorage(STORAGE_KEYS.admins, admins)
}

export function initializeDefaultAdmin(): void {
  const admins = getAdmins()
  if (admins.length === 0) {
    const defaultAdmin: AdminUser = {
      id: generateId(),
      name: 'Administrador',
      email: 'admin@gotaagota.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
    saveAdmin(defaultAdmin)
  }
}

// Authentication
export function login(email: string, password: string): { success: boolean; session?: AuthSession; error?: string } {
  const admins = getAdmins()
  const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
  
  if (admin) {
    const session: AuthSession = {
      userId: admin.id,
      userType: 'admin',
      email: admin.email,
      name: admin.name,
    }
    saveToStorage(STORAGE_KEYS.session, [session])
    return { success: true, session }
  }

  const collectors = getCollectors()
  const collector = collectors.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password && c.status === 'active')
  
  if (collector) {
    const session: AuthSession = {
      userId: collector.id,
      userType: 'collector',
      email: collector.email,
      name: collector.name,
    }
    saveToStorage(STORAGE_KEYS.session, [session])
    return { success: true, session }
  }

  return { success: false, error: 'Correo o contrasena incorrectos' }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.session)
  }
}

export function getCurrentSession(): AuthSession | null {
  const sessions = getFromStorage<AuthSession>(STORAGE_KEYS.session, [])
  return sessions.length > 0 ? sessions[0] : null
}

// Clients
export function getClients(): Client[] {
  return getFromStorage<Client>(STORAGE_KEYS.clients, [])
}

export function saveClient(client: Client): void {
  const clients = getClients()
  const index = clients.findIndex(c => c.id === client.id)
  if (index >= 0) {
    clients[index] = client
  } else {
    clients.push(client)
  }
  saveToStorage(STORAGE_KEYS.clients, clients)
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id)
  saveToStorage(STORAGE_KEYS.clients, clients)
}

// Collectors
export function getCollectors(): Collector[] {
  return getFromStorage<Collector>(STORAGE_KEYS.collectors, [])
}

export function saveCollector(collector: Collector): void {
  const collectors = getCollectors()
  const index = collectors.findIndex(c => c.id === collector.id)
  if (index >= 0) {
    collectors[index] = collector
  } else {
    collectors.push(collector)
  }
  saveToStorage(STORAGE_KEYS.collectors, collectors)
}

export function deleteCollector(id: string): void {
  const collectors = getCollectors().filter(c => c.id !== id)
  saveToStorage(STORAGE_KEYS.collectors, collectors)
}

// Loans
export function getLoans(): Loan[] {
  return getFromStorage<Loan>(STORAGE_KEYS.loans, [])
}

export function saveLoan(loan: Loan): void {
  const loans = getLoans()
  const index = loans.findIndex(l => l.id === loan.id)
  if (index >= 0) {
    loans[index] = loan
  } else {
    loans.push(loan)
  }
  saveToStorage(STORAGE_KEYS.loans, loans)
}

export function deleteLoan(id: string): void {
  const loans = getLoans().filter(l => l.id !== id)
  saveToStorage(STORAGE_KEYS.loans, loans)
}

// Payments
export function getPayments(): Payment[] {
  return getFromStorage<Payment>(STORAGE_KEYS.payments, [])
}

export function savePayment(payment: Payment): void {
  const payments = getPayments()
  payments.push(payment)
  saveToStorage(STORAGE_KEYS.payments, payments)
  
  // Update loan paid amount
  const loans = getLoans()
  const loan = loans.find(l => l.id === payment.loanId)
  if (loan) {
    loan.paidAmount += payment.amount
    loan.paidInstallments += 1
    if (loan.paidAmount >= loan.totalAmount) {
      loan.status = 'completed'
    }
    saveLoan(loan)
  }
}

// Visits
export function getVisits(): Visit[] {
  return getFromStorage<Visit>(STORAGE_KEYS.visits, [])
}

export function saveVisit(visit: Visit): void {
  const visits = getVisits()
  const index = visits.findIndex(v => v.id === visit.id)
  if (index >= 0) {
    visits[index] = visit
  } else {
    visits.push(visit)
  }
  saveToStorage(STORAGE_KEYS.visits, visits)
}

export function deleteVisit(id: string): void {
  const visits = getVisits().filter(v => v.id !== id)
  saveToStorage(STORAGE_KEYS.visits, visits)
}

// Inventory
export function getInventory(): InventoryItem[] {
  return getFromStorage<InventoryItem>(STORAGE_KEYS.inventory, [])
}

export function saveInventoryItem(item: InventoryItem): void {
  const inventory = getInventory()
  const index = inventory.findIndex(i => i.id === item.id)
  if (index >= 0) {
    inventory[index] = item
  } else {
    inventory.push(item)
  }
  saveToStorage(STORAGE_KEYS.inventory, inventory)
}

export function deleteInventoryItem(id: string): void {
  const inventory = getInventory().filter(i => i.id !== id)
  saveToStorage(STORAGE_KEYS.inventory, inventory)
}

// Helper functions
export function getClientsByCollector(collectorId: string): Client[] {
  return getClients().filter(c => c.collectorId === collectorId)
}

export function getLoansByCollector(collectorId: string): Loan[] {
  return getLoans().filter(l => l.collectorId === collectorId)
}

export function getLoansByClient(clientId: string): Loan[] {
  return getLoans().filter(l => l.clientId === clientId)
}

export function getPaymentsByLoan(loanId: string): Payment[] {
  return getPayments().filter(p => p.loanId === loanId)
}

export function getVisitsByCollector(collectorId: string): Visit[] {
  return getVisits().filter(v => v.collectorId === collectorId)
}

export function getInventoryByCollector(collectorId: string): InventoryItem[] {
  return getInventory().filter(i => i.collectorId === collectorId)
}

// Statistics
export function getPortfolioStats() {
  const loans = getLoans()
  const activeLoans = loans.filter(l => l.status === 'active')
  
  const totalPortfolio = activeLoans.reduce((sum, l) => sum + l.totalAmount, 0)
  const totalPaid = activeLoans.reduce((sum, l) => sum + l.paidAmount, 0)
  const totalPending = totalPortfolio - totalPaid
  
  return {
    totalLoans: loans.length,
    activeLoans: activeLoans.length,
    completedLoans: loans.filter(l => l.status === 'completed').length,
    defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
    totalPortfolio,
    totalPaid,
    totalPending,
  }
}

export function getCollectorStats(collectorId: string) {
  const loans = getLoansByCollector(collectorId)
  const clients = getClientsByCollector(collectorId)
  const activeLoans = loans.filter(l => l.status === 'active')
  
  const totalPortfolio = activeLoans.reduce((sum, l) => sum + l.totalAmount, 0)
  const totalPaid = activeLoans.reduce((sum, l) => sum + l.paidAmount, 0)
  
  return {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalLoans: loans.length,
    activeLoans: activeLoans.length,
    totalPortfolio,
    totalPaid,
    totalPending: totalPortfolio - totalPaid,
  }
}
