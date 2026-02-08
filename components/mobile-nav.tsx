'use client'

import { 
  Users, 
  Wallet, 
  Calendar, 
  LayoutDashboard,
  Menu,
  X,
  Building2,
  User,
  Briefcase,
  Package,
  TrendingUp,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ViewMode, AuthSession } from '@/lib/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
  currentView: string
  onViewChange: (view: string) => void
  viewMode: ViewMode
  session: AuthSession
  onLogout: () => void
}

export function MobileNav({ 
  currentView, 
  onViewChange, 
  viewMode, 
  session,
  onLogout
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  const handleViewChange = (view: string) => {
    onViewChange(view)
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">Gota a Gota</h1>
              <p className="text-[10px] text-muted-foreground leading-none">
                {isAdmin ? 'Oficina' : 'Cobrador'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav className={cn(
        "lg:hidden fixed top-[60px] right-0 z-50 w-72 h-[calc(100vh-60px)] bg-card border-l border-border transition-transform duration-300 ease-out shadow-xl flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
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
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Menu
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200",
                    currentView === item.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full rounded-xl gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </Button>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border px-2 py-2 shadow-lg">
        <div className="flex justify-around">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                currentView === item.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                currentView === item.id ? "scale-110" : ""
              )} />
              <span className="text-[10px] font-medium">{item.label.split(' ').pop()}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
