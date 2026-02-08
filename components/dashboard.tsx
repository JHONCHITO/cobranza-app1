'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Briefcase, 
  Wallet, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { 
  getClients, 
  getCollectors, 
  getPortfolioStats 
} from '@/lib/store'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCollectors: 0,
    activeLoans: 0,
    totalPortfolio: 0,
    totalPaid: 0,
    totalPending: 0,
    completedLoans: 0,
    defaultedLoans: 0,
  })

  useEffect(() => {
    const clients = getClients()
    const collectors = getCollectors()
    const portfolioStats = getPortfolioStats()

    setStats({
      totalClients: clients.length,
      totalCollectors: collectors.length,
      activeLoans: portfolioStats.activeLoans,
      totalPortfolio: portfolioStats.totalPortfolio,
      totalPaid: portfolioStats.totalPaid,
      totalPending: portfolioStats.totalPending,
      completedLoans: portfolioStats.completedLoans,
      defaultedLoans: portfolioStats.defaultedLoans,
    })
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const collectionRate = stats.totalPortfolio ? Math.round((stats.totalPaid / stats.totalPortfolio) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del sistema de cobranzas</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-0 shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Clientes</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalClients}</p>
                <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-accent/5 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cobradores</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalCollectors}</p>
                <p className="text-xs text-muted-foreground mt-1">Activos en campo</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-chart-3/5 hover:shadow-lg hover:shadow-chart-3/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Prestamos Activos</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeLoans}</p>
                <p className="text-xs text-muted-foreground mt-1">En curso actualmente</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-chart-3/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-chart-1/5 hover:shadow-lg hover:shadow-chart-1/10 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cartera Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalPortfolio)}</p>
                <p className="text-xs text-muted-foreground mt-1">Valor total prestado</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-chart-1/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/5 to-accent/10 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-semibold text-foreground">Total Recaudado</p>
              </div>
              <p className="text-3xl font-bold text-accent mb-2">{formatCurrency(stats.totalPaid)}</p>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-accent" />
                <p className="text-sm text-muted-foreground">Pagos recibidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-chart-3/5 to-chart-3/10 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-chart-3" />
                </div>
                <p className="text-sm font-semibold text-foreground">Por Cobrar</p>
              </div>
              <p className="text-3xl font-bold text-chart-3 mb-2">{formatCurrency(stats.totalPending)}</p>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-chart-3" />
                <p className="text-sm text-muted-foreground">Pendiente de cobro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Estado de Prestamos</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-accent/10">
                <p className="text-2xl font-bold text-accent">{stats.completedLoans}</p>
                <p className="text-xs text-muted-foreground mt-1">Completados</p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{stats.defaultedLoans}</p>
                <p className="text-xs text-muted-foreground mt-1">En mora</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-foreground">Tasa de Recaudo</p>
              <p className="text-sm text-muted-foreground">Porcentaje de cartera recaudada</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{collectionRate}%</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-4 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
