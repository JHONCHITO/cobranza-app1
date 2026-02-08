'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Plus, Search, DollarSign, TrendingUp } from 'lucide-react'
import { Client, Collector, Loan, Payment } from '@/lib/types'
import { 
  getClients, 
  getCollectors,
  getLoans,
  getLoansByClient,
  getLoansByCollector,
  getPaymentsByLoan,
  saveLoan,
  savePayment,
  generateId 
} from '@/lib/store'

interface PortfolioModuleProps {
  collectorFilter?: string
}

export function PortfolioModule({ collectorFilter }: PortfolioModuleProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollector, setSelectedCollector] = useState<string>('all')
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [loanFormData, setLoanFormData] = useState({
    clientId: '',
    collectorId: '',
    amount: '',
    interestRate: '20',
    installments: '30',
  })
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    let allClients = getClients()
    let allLoans = getLoans()
    
    if (collectorFilter) {
      allClients = allClients.filter(c => c.collectorId === collectorFilter)
      allLoans = allLoans.filter(l => l.collectorId === collectorFilter)
    }
    
    setClients(allClients)
    setCollectors(getCollectors())
    setLoans(allLoans)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const filteredLoans = loans.filter(loan => {
    const client = clients.find(c => c.id === loan.clientId)
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCollector = selectedCollector === 'all' || loan.collectorId === selectedCollector
    return matchesSearch && matchesCollector
  })

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(loanFormData.amount)
    const interestRate = parseFloat(loanFormData.interestRate)
    const installments = parseInt(loanFormData.installments)
    const totalAmount = amount * (1 + interestRate / 100)
    const installmentAmount = Math.ceil(totalAmount / installments)

    const client = clients.find(c => c.id === loanFormData.clientId)
    
    const loan: Loan = {
      id: generateId(),
      clientId: loanFormData.clientId,
      collectorId: collectorFilter || loanFormData.collectorId || client?.collectorId || '',
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
    
    saveLoan(loan)
    loadData()
    setIsLoanDialogOpen(false)
    setLoanFormData({
      clientId: '',
      collectorId: '',
      amount: '',
      interestRate: '20',
      installments: '30',
    })
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return

    const payment: Payment = {
      id: generateId(),
      loanId: selectedLoan.id,
      clientId: selectedLoan.clientId,
      collectorId: selectedLoan.collectorId,
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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Desconocido'
  }

  const getCollectorName = (collectorId: string) => {
    const collector = collectors.find(c => c.id === collectorId)
    return collector?.name || 'Sin asignar'
  }

  const getProgressPercentage = (loan: Loan) => {
    return Math.round((loan.paidAmount / loan.totalAmount) * 100)
  }

  // Calculate totals
  const totals = {
    totalPortfolio: filteredLoans.reduce((sum, l) => sum + l.totalAmount, 0),
    totalPaid: filteredLoans.reduce((sum, l) => sum + l.paidAmount, 0),
    totalPending: filteredLoans.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0),
    activeLoans: filteredLoans.filter(l => l.status === 'active').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {collectorFilter ? 'Mi Cartera' : 'Cartera'}
          </h2>
          <p className="text-muted-foreground">Gestiona los prestamos y pagos</p>
        </div>
        <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Prestamo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Prestamo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={loanFormData.clientId}
                  onValueChange={(value) => setLoanFormData({ ...loanFormData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.cedula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!collectorFilter && (
                <div className="space-y-2">
                  <Label htmlFor="collector">Cobrador</Label>
                  <Select
                    value={loanFormData.collectorId}
                    onValueChange={(value) => setLoanFormData({ ...loanFormData, collectorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cobrador" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.map((collector) => (
                        <SelectItem key={collector.id} value={collector.id}>
                          {collector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Monto del Prestamo</Label>
                <Input
                  id="amount"
                  type="number"
                  value={loanFormData.amount}
                  onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                  placeholder="100000"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interes (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={loanFormData.interestRate}
                    onChange={(e) => setLoanFormData({ ...loanFormData, interestRate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installments">Cuotas</Label>
                  <Input
                    id="installments"
                    type="number"
                    value={loanFormData.installments}
                    onChange={(e) => setLoanFormData({ ...loanFormData, installments: e.target.value })}
                    required
                  />
                </div>
              </div>
              {loanFormData.amount && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Resumen del Prestamo</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Capital:</span>
                    <span>{formatCurrency(parseFloat(loanFormData.amount) || 0)}</span>
                    <span className="text-muted-foreground">Total a pagar:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        (parseFloat(loanFormData.amount) || 0) * 
                        (1 + (parseFloat(loanFormData.interestRate) || 0) / 100)
                      )}
                    </span>
                    <span className="text-muted-foreground">Cuota diaria:</span>
                    <span>
                      {formatCurrency(
                        Math.ceil(
                          ((parseFloat(loanFormData.amount) || 0) * 
                          (1 + (parseFloat(loanFormData.interestRate) || 0) / 100)) /
                          (parseInt(loanFormData.installments) || 1)
                        )
                      )}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Crear Prestamo
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLoanDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cartera Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totals.totalPortfolio)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Recaudado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(totals.totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-chart-3/10 border-chart-3/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              {formatCurrency(totals.totalPending)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prestamos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totals.activeLoans}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {!collectorFilter && (
              <Select value={selectedCollector} onValueChange={setSelectedCollector}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por cobrador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cobradores</SelectItem>
                  {collectors.map((collector) => (
                    <SelectItem key={collector.id} value={collector.id}>
                      {collector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                {!collectorFilter && <TableHead>Cobrador</TableHead>}
                <TableHead>Capital</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Pendiente</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={collectorFilter ? 8 : 9} className="text-center py-8 text-muted-foreground">
                    No hay prestamos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{getClientName(loan.clientId)}</TableCell>
                    {!collectorFilter && (
                      <TableCell>{getCollectorName(loan.collectorId)}</TableCell>
                    )}
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.totalAmount)}</TableCell>
                    <TableCell className="text-accent">{formatCurrency(loan.paidAmount)}</TableCell>
                    <TableCell className="text-chart-3">
                      {formatCurrency(loan.totalAmount - loan.paidAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercentage(loan)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[40px]">
                          {getProgressPercentage(loan)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        loan.status === 'active' 
                          ? 'bg-primary/20 text-primary' 
                          : loan.status === 'completed'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {loan.status === 'active' ? 'Activo' : loan.status === 'completed' ? 'Completado' : 'En mora'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {loan.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => openPaymentDialog(loan)}
                          className="gap-1"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{getClientName(selectedLoan.clientId)}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Cuota sugerida:</span>
                  <span>{formatCurrency(selectedLoan.installmentAmount)}</span>
                  <span className="text-muted-foreground">Pendiente:</span>
                  <span>{formatCurrency(selectedLoan.totalAmount - selectedLoan.paidAmount)}</span>
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
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Registrar Pago
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
