'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { AuthSession, Client, Loan, Payment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Droplets, 
  Home,
  Users, 
  Wallet, 
  Calendar, 
  LogOut,
  Plus,
  Phone,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  CreditCard,
  FileText
} from 'lucide-react'
import { 
  getClientsByCollector,
  getLoansByCollector,
  getPaymentsByLoan,
  getVisitsByCollector,
  getCollectorStats,
  saveClient,
  savePayment,
  saveLoan,
  generateId
} from '@/lib/store'

interface CollectorAppProps {
  session: AuthSession
  onLogout: () => void
}

export function CollectorApp({ session, onLogout }: CollectorAppProps) {
  const [currentView, setCurrentView] = useState('home')
  const [clients, setClients] = useState<Client[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPortfolio: 0,
    totalPaid: 0,
    totalPending: 0,
  })
  
  // Client form
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '',
    cedula: '',
    phone: '',
    address: '',
    email: '',
  })

  // Payment form
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  // Loan form
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
  const [loanForm, setLoanForm] = useState({
    clientId: '',
    amount: '',
    interestRate: '20',
    installments: '30',
  })

  // Loan detail
  const [selectedLoanDetail, setSelectedLoanDetail] = useState<Loan | null>(null)
  const [loanPayments, setLoanPayments] = useState<Payment[]>([])

  useEffect(() => {
    loadData()
  }, [session.userId, currentView])

  const loadData = () => {
    const collectorClients = getClientsByCollector(session.userId)
    const collectorLoans = getLoansByCollector(session.userId)
    const collectorStats = getCollectorStats(session.userId)
    
    setClients(collectorClients)
    setLoans(collectorLoans)
    setStats(collectorStats)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    const newClient: Client = {
      id: generateId(),
      name: clientForm.name,
      cedula: clientForm.cedula,
      phone: clientForm.phone,
      address: clientForm.address,
      email: clientForm.email,
      collectorId: session.userId,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    saveClient(newClient)
    loadData()
    setIsClientDialogOpen(false)
    setClientForm({ name: '', cedula: '', phone: '', address: '', email: '' })
  }

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(loanForm.amount)
    const interestRate = parseFloat(loanForm.interestRate)
    const installments = parseInt(loanForm.installments)
    const totalAmount = amount * (1 + interestRate / 100)
    const installmentAmount = Math.ceil(totalAmount / installments)

    const newLoan: Loan = {
      id: generateId(),
      clientId: loanForm.clientId,
      collectorId: session.userId,
      amount,
      interestRate,
      totalAmount,
      paidAmount: 0,
      installments,
      paidInstallments: 0,
      installmentAmount,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + installments * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    
    saveLoan(newLoan)
    loadData()
    setIsLoanDialogOpen(false)
    setLoanForm({ clientId: '', amount: '', interestRate: '20', installments: '30' })
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return

    const payment: Payment = {
      id: generateId(),
      loanId: selectedLoan.id,
      clientId: selectedLoan.clientId,
      collectorId: session.userId,
      amount: parseFloat(paymentAmount),
      date: new Date().toISOString(),
      notes: paymentNotes,
      createdAt: new Date().toISOString(),
    }

    savePayment(payment)
    loadData()
    setIsPaymentDialogOpen(false)
    setSelectedLoan(null)
    setPaymentAmount('')
    setPaymentNotes('')
  }

  const openPaymentDialog = (loan: Loan) => {
    setSelectedLoan(loan)
    setPaymentAmount(loan.installmentAmount.toString())
    setIsPaymentDialogOpen(true)
  }

  const openLoanDetail = (loan: Loan) => {
    setSelectedLoanDetail(loan)
    const payments = getPaymentsByLoan(loan.id)
    setLoanPayments(payments)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Desconocido'
  }

  const getProgressPercentage = (loan: Loan) => {
    return Math.round((loan.paidAmount / loan.totalAmount) * 100)
  }

  const collectionRate = stats.totalPortfolio ? Math.round((stats.totalPaid / stats.totalPortfolio) * 100) : 0

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'portfolio', label: 'Cartera', icon: Wallet },
    { id: 'calendar', label: 'Visitas', icon: Calendar },
  ]

  const renderHome = () => (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
        <h2 className="text-xl font-bold">Hola, {session.name.split(' ')[0]}</h2>
        <p className="text-primary-foreground/80 text-sm mt-1">
          Encuentra todo lo que necesitas para el cobro del dia...
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeLoans}</p>
                <p className="text-xs text-muted-foreground">Prestamos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 gap-3">
        <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Recaudado</p>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{collectionRate}%</p>
                <p className="text-xs text-muted-foreground">de la cartera</p>
              </div>
            </div>
            <div className="mt-3 w-full bg-primary/20 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/50 bg-gradient-to-r from-secondary/10 to-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-secondary-foreground" />
                  <p className="text-sm font-medium text-foreground">Por Cobrar</p>
                </div>
                <p className="text-2xl font-bold text-secondary-foreground">{formatCurrency(stats.totalPending)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          className="h-auto py-4 flex-col gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
          onClick={() => setIsClientDialogOpen(true)}
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-semibold">Nuevo Cliente</span>
        </Button>
        <Button 
          className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90 rounded-xl"
          onClick={() => setIsLoanDialogOpen(true)}
        >
          <CreditCard className="w-6 h-6" />
          <span className="text-sm font-semibold">Nuevo Prestamo</span>
        </Button>
      </div>
    </div>
  )

  const renderClients = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Mis Clientes</h2>
        <Button 
          size="sm" 
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
          onClick={() => setIsClientDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No tienes clientes asignados</p>
            <Button 
              className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => setIsClientDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Card key={client.id} className="border-2 border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderPortfolio = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Mi Cartera</h2>
        <Button 
          size="sm" 
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
          onClick={() => setIsLoanDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Prestamo
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-primary/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalPortfolio)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/10">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-primary">{formatCurrency(stats.totalPaid)}</p>
            <p className="text-xs text-muted-foreground">Pagado</p>
          </CardContent>
        </Card>
        <Card className="border-secondary/50 bg-secondary/10">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-secondary-foreground">{formatCurrency(stats.totalPending)}</p>
            <p className="text-xs text-muted-foreground">Pendiente</p>
          </CardContent>
        </Card>
      </div>

      {loans.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="py-12 text-center">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay prestamos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <Card 
              key={loan.id} 
              className={`border-2 cursor-pointer transition-all ${
                loan.status === 'active' 
                  ? 'border-primary/30 hover:border-primary' 
                  : 'border-muted'
              }`}
              onClick={() => openLoanDetail(loan)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{getClientName(loan.clientId)}</h3>
                    <p className="text-xs text-muted-foreground">
                      Cuota: {formatCurrency(loan.installmentAmount)} | {loan.paidInstallments}/{loan.installments} cuotas
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    loan.status === 'active' 
                      ? 'bg-primary/20 text-primary' 
                      : loan.status === 'completed'
                      ? 'bg-green-500/20 text-green-700'
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {loan.status === 'active' ? 'Activo' : loan.status === 'completed' ? 'Pagado' : 'Mora'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium text-foreground">{getProgressPercentage(loan)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(loan)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pagado: {formatCurrency(loan.paidAmount)}</span>
                    <span>Debe: {formatCurrency(loan.totalAmount - loan.paidAmount)}</span>
                  </div>
                </div>

                {loan.status === 'active' && (
                  <Button 
                    className="w-full mt-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      openPaymentDialog(loan)
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderCalendar = () => {
    const visits = getVisitsByCollector(session.userId)
    const today = new Date().toISOString().split('T')[0]
    const todayVisits = visits.filter(v => v.scheduledDate.startsWith(today))

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Visitas de Hoy</h2>

        {todayVisits.length === 0 ? (
          <Card className="border-2 border-dashed border-primary/30">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No tienes visitas programadas para hoy</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayVisits.map((visit) => (
              <Card key={visit.id} className="border-2 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{getClientName(visit.clientId)}</h3>
                      <p className="text-sm text-muted-foreground">{visit.notes}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      visit.status === 'pending' 
                        ? 'bg-secondary text-secondary-foreground' 
                        : visit.status === 'completed'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {visit.status === 'pending' ? 'Pendiente' : visit.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary-foreground">GOTA A GOTA</h1>
              <p className="text-xs text-secondary-foreground/80">Cobrador</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout}
            className="bg-transparent border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4">
        {currentView === 'home' && renderHome()}
        {currentView === 'clients' && renderClients()}
        {currentView === 'portfolio' && renderPortfolio()}
        {currentView === 'calendar' && renderCalendar()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-primary shadow-lg z-50">
        <div className="flex justify-around py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                currentView === item.id
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-primary-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre Completo</Label>
              <Input
                id="clientName"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                placeholder="Juan Perez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCedula">Cedula</Label>
              <Input
                id="clientCedula"
                value={clientForm.cedula}
                onChange={(e) => setClientForm({ ...clientForm, cedula: e.target.value })}
                placeholder="12345678"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefono</Label>
              <Input
                id="clientPhone"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                placeholder="311-555-1234"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Direccion</Label>
              <Input
                id="clientAddress"
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                placeholder="Calle 123 #45-67"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-primary">Guardar</Button>
              <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loan Dialog */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Nuevo Prestamo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLoan} className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={loanForm.clientId}
                onValueChange={(value) => setLoanForm({ ...loanForm, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Monto del Prestamo</Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                placeholder="100000"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interes (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={loanForm.interestRate}
                  onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="installments">Cuotas</Label>
                <Input
                  id="installments"
                  type="number"
                  value={loanForm.installments}
                  onChange={(e) => setLoanForm({ ...loanForm, installments: e.target.value })}
                  required
                />
              </div>
            </div>
            {loanForm.amount && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total a pagar:</span>
                  <span className="font-bold">{formatCurrency(parseFloat(loanForm.amount) * (1 + parseFloat(loanForm.interestRate) / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cuota diaria:</span>
                  <span className="font-bold">
                    {formatCurrency(Math.ceil((parseFloat(loanForm.amount) * (1 + parseFloat(loanForm.interestRate) / 100)) / parseInt(loanForm.installments)))}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-primary">Crear Prestamo</Button>
              <Button type="button" variant="outline" onClick={() => setIsLoanDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold">{getClientName(selectedLoan.clientId)}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <span className="text-muted-foreground">Cuota sugerida:</span>
                  <span className="font-medium">{formatCurrency(selectedLoan.installmentAmount)}</span>
                  <span className="text-muted-foreground">Saldo pendiente:</span>
                  <span className="font-medium text-destructive">{formatCurrency(selectedLoan.totalAmount - selectedLoan.paidAmount)}</span>
                  <span className="text-muted-foreground">Cuotas restantes:</span>
                  <span className="font-medium">{selectedLoan.installments - selectedLoan.paidInstallments}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Monto del Pago</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Notas (opcional)</Label>
                <Input
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Observaciones del pago"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-primary">Registrar Pago</Button>
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Loan Detail Dialog */}
      <Dialog open={!!selectedLoanDetail} onOpenChange={() => setSelectedLoanDetail(null)}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Prestamo</DialogTitle>
          </DialogHeader>
          {selectedLoanDetail && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl">
                <h3 className="font-bold text-lg">{getClientName(selectedLoanDetail.clientId)}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital:</span>
                    <span className="font-medium">{formatCurrency(selectedLoanDetail.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total a pagar:</span>
                    <span className="font-bold">{formatCurrency(selectedLoanDetail.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagado:</span>
                    <span className="font-medium text-primary">{formatCurrency(selectedLoanDetail.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo:</span>
                    <span className="font-bold text-destructive">{formatCurrency(selectedLoanDetail.totalAmount - selectedLoanDetail.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cuotas:</span>
                    <span className="font-medium">{selectedLoanDetail.paidInstallments} / {selectedLoanDetail.installments}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Historial de Pagos
                </h4>
                {loanPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay pagos registrados</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loanPayments.map((payment, index) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-muted rounded-lg text-sm">
                        <div>
                          <p className="font-medium">Pago #{index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <span className="font-bold text-primary">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedLoanDetail.status === 'active' && (
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => {
                    setSelectedLoanDetail(null)
                    openPaymentDialog(selectedLoanDetail)
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Registrar Pago
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
