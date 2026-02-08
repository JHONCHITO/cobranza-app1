'use client'

import { 
  Users, 
  Briefcase, 
  Wallet, 
  Calendar, 
  Package, 
  LayoutDashboard,
  Building2,
  User,
  TrendingUp,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ViewMode, AuthSession } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface AppSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  viewMode: ViewMode
  session: AuthSession
  onLogout: () => void
}

export function AppSidebar({ 
  currentView, 
  onViewChange, 
  viewMode, 
  session,
  onLogout
}: AppSidebarProps) {
  const officeMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collectors', label: 'Cobradores', icon: Briefcase },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'portfolio', label: 'Cartera', icon: Wallet },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'inventory', label: 'Inventario', icon: Package },
  ]

  const collectorMenuItems = [
    { id: 'dashboard', label: 'Mi Panel', icon: LayoutDashboard },
    { id: 'clients', label: 'Mis Clientes', icon: Users },
    { id: 'portfolio', label: 'Mi Cartera', icon: Wallet },
    { id: 'calendar', label: 'Mi Calendario', icon: Calendar },
  ]

  const menuItems = viewMode === 'office' ? officeMenuItems : collectorMenuItems
  const isAdmin = session.userType === 'admin'

  return (
    <aside className="fixed left-0 top-0 w-64 bg-card border-r border-border flex flex-col h-screen shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Gota a Gota</h1>
            <p className="text-xs text-muted-foreground">Sistema de Control</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl",
          isAdmin ? "bg-primary/10" : "bg-accent/10"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isAdmin ? "bg-primary/20" : "bg-accent/20"
          )}>
            {isAdmin ? (
              <Building2 className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{session.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.email}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {isAdmin ? 'Administrador' : 'Cobrador'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Menu Principal
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  currentView === item.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  currentView === item.id ? "text-primary-foreground" : ""
                )} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full rounded-xl gap-2 justify-start bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesion
        </Button>
      </div>
    </aside>
  )
}
