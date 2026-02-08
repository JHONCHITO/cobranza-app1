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
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Client, Collector, Loan, Visit } from '@/lib/types'
import { 
  getClients, 
  getCollectors,
  getLoans,
  getVisits,
  saveVisit,
  deleteVisit,
  generateId 
} from '@/lib/store'
import { cn } from '@/lib/utils'

interface CalendarModuleProps {
  collectorFilter?: string
}

export function CalendarModule({ collectorFilter }: CalendarModuleProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    collectorId: '',
    loanId: '',
    scheduledDate: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    let allClients = getClients()
    let allVisits = getVisits()
    let allLoans = getLoans()
    
    if (collectorFilter) {
      allClients = allClients.filter(c => c.collectorId === collectorFilter)
      allVisits = allVisits.filter(v => v.collectorId === collectorFilter)
      allLoans = allLoans.filter(l => l.collectorId === collectorFilter)
    }
    
    setClients(allClients)
    setCollectors(getCollectors())
    setLoans(allLoans)
    setVisits(allVisits)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getVisitsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return visits.filter(v => v.scheduledDate.startsWith(dateStr))
  }

  const formatDate = (day: number) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (day: number) => {
    setSelectedDate(formatDate(day))
    setFormData({ ...formData, scheduledDate: formatDate(day) })
  }

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault()
    const client = clients.find(c => c.id === formData.clientId)
    
    const visit: Visit = {
      id: generateId(),
      clientId: formData.clientId,
      collectorId: collectorFilter || formData.collectorId || client?.collectorId || '',
      loanId: formData.loanId,
      scheduledDate: formData.scheduledDate,
      status: 'pending',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    }
    
    saveVisit(visit)
    loadData()
    setIsDialogOpen(false)
    setFormData({
      clientId: '',
      collectorId: '',
      loanId: '',
      scheduledDate: '',
      notes: '',
    })
  }

  const handleUpdateVisitStatus = (visit: Visit, status: 'completed' | 'missed') => {
    saveVisit({ ...visit, status })
    loadData()
  }

  const handleDeleteVisit = (id: string) => {
    if (confirm('Esta seguro de eliminar esta visita?')) {
      deleteVisit(id)
      loadData()
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Desconocido'
  }

  const getClientPhone = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.phone || ''
  }

  const getClientAddress = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.address || ''
  }

  const getActiveLoansForClient = (clientId: string) => {
    return loans.filter(l => l.clientId === clientId && l.status === 'active')
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const days = getDaysInMonth(currentDate)
  const today = new Date()
  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const selectedDateVisits = selectedDate 
    ? visits.filter(v => v.scheduledDate.startsWith(selectedDate))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {collectorFilter ? 'Mi Calendario' : 'Calendario'}
          </h2>
          <p className="text-muted-foreground">Programa y gestiona visitas de cobro</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Programar Visita</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVisit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, clientId: value, loanId: '' })
                  }}
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
              {formData.clientId && getActiveLoansForClient(formData.clientId).length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="loan">Prestamo (opcional)</Label>
                  <Select
                    value={formData.loanId}
                    onValueChange={(value) => setFormData({ ...formData, loanId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prestamo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getActiveLoansForClient(formData.clientId).map((loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          ${loan.totalAmount.toLocaleString()} - Pendiente: ${(loan.totalAmount - loan.paidAmount).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instrucciones o recordatorios"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Programar Visita
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const dayVisits = day ? getVisitsForDate(day) : []
                const pendingCount = dayVisits.filter(v => v.status === 'pending').length
                const completedCount = dayVisits.filter(v => v.status === 'completed').length
                
                return (
                  <div
                    key={index}
                    onClick={() => day && handleDayClick(day)}
                    className={cn(
                      "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors",
                      day ? "hover:bg-muted" : "bg-transparent cursor-default",
                      isToday(day || 0) && "bg-primary/10 border-primary",
                      selectedDate === formatDate(day || 0) && "ring-2 ring-primary"
                    )}
                  >
                    {day && (
                      <>
                        <span className={cn(
                          "text-sm font-medium",
                          isToday(day) && "text-primary"
                        )}>
                          {day}
                        </span>
                        {dayVisits.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {pendingCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-chart-3">
                                <Clock className="w-3 h-3" />
                                {pendingCount}
                              </div>
                            )}
                            {completedCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-accent">
                                <CheckCircle className="w-3 h-3" />
                                {completedCount}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate 
                ? `Visitas del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`
                : 'Selecciona un dia'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateVisits.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateVisits.map((visit) => (
                    <div 
                      key={visit.id} 
                      className={cn(
                        "p-4 rounded-lg border",
                        visit.status === 'pending' && "bg-chart-3/5 border-chart-3/30",
                        visit.status === 'completed' && "bg-accent/5 border-accent/30",
                        visit.status === 'missed' && "bg-destructive/5 border-destructive/30"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{getClientName(visit.clientId)}</h4>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          visit.status === 'pending' && "bg-chart-3/20 text-chart-3",
                          visit.status === 'completed' && "bg-accent/20 text-accent",
                          visit.status === 'missed' && "bg-destructive/20 text-destructive"
                        )}>
                          {visit.status === 'pending' ? 'Pendiente' : 
                           visit.status === 'completed' ? 'Completada' : 'No asistio'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {getClientPhone(visit.clientId)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {getClientAddress(visit.clientId)}
                        </div>
                        {visit.notes && (
                          <p className="mt-2 text-xs italic">{visit.notes}</p>
                        )}
                      </div>
                      {visit.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-accent border-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                            onClick={() => handleUpdateVisitStatus(visit, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Completada
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                            onClick={() => handleUpdateVisitStatus(visit, 'missed')}
                          >
                            <XCircle className="w-4 h-4" />
                            No asistio
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay visitas programadas para este dia
                </p>
              )
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Haz clic en un dia del calendario para ver las visitas
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
