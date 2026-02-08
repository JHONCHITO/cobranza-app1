'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Wallet, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  ChevronRight
} from 'lucide-react'
import { 
  getCollectorStats,
  getVisitsByCollector,
  getClientsByCollector,
} from '@/lib/store'
import { Visit, Client } from '@/lib/types'

interface CollectorDashboardProps {
  collectorId: string
}

export function CollectorDashboard({ collectorId }: CollectorDashboardProps) {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPortfolio: 0,
    totalPaid: 0,
    totalPending: 0,
  })
  const [todayVisits, setTodayVisits] = useState<Visit[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const collectorStats = getCollectorStats(collectorId)
    setStats(collectorStats)

    const allVisits = getVisitsByCollector(collectorId)
    const today = new Date().toISOString().split('T')[0]
    setTodayVisits(allVisits.filter(v => v.scheduledDate.startsWith(today) && v.status === 'pending'))
    
    setClients(getClientsByCollector(collectorId))
  }, [collectorId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
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

  const collectionRate = stats.totalPortfolio ? Math.round((stats.totalPaid / stats.totalPortfolio) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Mi Panel</h2>
        <p className="text-muted-foreground text-sm">Resumen de tu actividad diaria</p>
      </div>

      {/* Stats Grid - Optimized for mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeLoans}</p>
                <p className="text-xs text-muted-foreground">Prestamos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalPortfolio)}</p>
                <p className="text-xs text-muted-foreground">Mi Cartera</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{todayVisits.length}</p>
                <p className="text-xs text-muted-foreground">Visitas Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/5 to-accent/10 overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <p className="text-sm font-semibold text-foreground">Recaudado</p>
              </div>
              <p className="text-2xl font-bold text-accent mb-3">{formatCurrency(stats.totalPaid)}</p>
              <div className="w-full bg-accent/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{collectionRate}% de la cartera</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-chart-3/5 to-chart-3/10 overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-3/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-chart-3" />
                <p className="text-sm font-semibold text-foreground">Por Cobrar</p>
              </div>
              <p className="text-2xl font-bold text-chart-3 mb-3">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-muted-foreground">Pendiente de recaudar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Visits */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            Visitas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayVisits.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No tienes visitas programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayVisits.map((visit) => (
                <div 
                  key={visit.id}
                  className="p-4 bg-muted/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{getClientName(visit.clientId)}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{getClientPhone(visit.clientId)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{getClientAddress(visit.clientId)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs bg-chart-3/15 text-chart-3 px-2.5 py-1 rounded-full font-medium">
                        Pendiente
                      </span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50 italic">
                      {visit.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
