'use client'

import { useState, useEffect } from 'react'
import { AuthSession } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Droplets, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Wallet, 
  Calendar, 
  Package,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Clock
} from 'lucide-react'
import { CollectorsModule } from '@/components/collectors-module'
import { ClientsModule } from '@/components/clients-module'
import { PortfolioModule } from '@/components/portfolio-module'
import { CalendarModule } from '@/components/calendar-module'
import { InventoryModule } from '@/components/inventory-module'
import { 
  getClients, 
  getCollectors, 
  getLoans, 
  getPayments 
} from '@/lib/store'

interface OfficeDashboardProps {
  session: AuthSession
  onLogout: () => void
}

export function OfficeDashboard({ session, onLogout }: OfficeDashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCollectors: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPortfolio: 0,
    totalPaid: 0,
    totalPending: 0,
  })

  useEffect(() => {
    loadStats()
  }, [currentView])

  const loadStats = () => {
    const clients = getClients()
    const collectors = getCollectors()
    const loans = getLoans()
    const payments = getPayments()

    const totalPortfolio = loans.reduce((sum, l) => sum + l.totalAmount, 0)
    const totalPaid = loans.reduce((sum, l) => sum + l.paidAmount, 0)

    setStats({
      totalClients: clients.filter(c => c.status === 'active').length,
      totalCollectors: collectors.filter(c => c.status === 'active').length,
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'active').length,
      totalPortfolio,
      totalPaid,
      totalPending: totalPortfolio - totalPaid,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collectors', label: 'Cobradores', icon: UserCheck },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'portfolio', label: 'Cartera', icon: Wallet },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'inventory', label: 'Inventario', icon: Package },
  ]

  const renderContent = () => {
    switch (currentView) {
      case 'collectors':
        return <CollectorsModule />
      case 'clients':
        return <ClientsModule />
      case 'portfolio':
        return <PortfolioModule />
      case 'calendar':
        return <CalendarModule />
      case 'inventory':
        return <InventoryModule />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 to-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.totalCollectors}</p>
                <p className="text-sm text-muted-foreground">Cobradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.activeLoans}</p>
                <p className="text-sm text-muted-foreground">Prestamos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 to-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalPortfolio)}</p>
                <p className="text-sm text-muted-foreground">Cartera Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              Total Recaudado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(stats.totalPaid)}</p>
            <div className="mt-3 w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${stats.totalPortfolio ? (stats.totalPaid / stats.totalPortfolio) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.totalPortfolio ? Math.round((stats.totalPaid / stats.totalPortfolio) * 100) : 0}% de la cartera
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              Por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary-foreground">{formatCurrency(stats.totalPending)}</p>
            <p className="text-sm text-muted-foreground mt-2">Pendiente de recaudar</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rapidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
              onClick={() => setCurrentView('collectors')}
            >
              <UserCheck className="w-6 h-6" />
              <span>Nuevo Cobrador</span>
            </Button>
            <Button 
              className="h-auto py-4 flex-col gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => setCurrentView('clients')}
            >
              <Users className="w-6 h-6" />
              <span>Nuevo Cliente</span>
            </Button>
            <Button 
              className="h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
              onClick={() => setCurrentView('portfolio')}
            >
              <Wallet className="w-6 h-6" />
              <span>Nuevo Prestamo</span>
            </Button>
            <Button 
              className="h-auto py-4 flex-col gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => setCurrentView('calendar')}
            >
              <Calendar className="w-6 h-6" />
              <span>Nueva Visita</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-foreground/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-secondary-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-secondary-foreground" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Droplets className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-secondary-foreground">GOTA A GOTA</h1>
                <p className="text-xs text-secondary-foreground/80">Panel de Oficina</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-secondary-foreground">{session.name}</p>
              <p className="text-xs text-secondary-foreground/80">{session.email}</p>
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
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-primary flex-col">
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                currentView === item.id
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-primary-foreground hover:bg-primary-foreground/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-16 bottom-0 w-64 bg-primary">
            <nav className="py-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-secondary text-secondary-foreground font-semibold'
                      : 'text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
