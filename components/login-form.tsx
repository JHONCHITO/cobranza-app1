'use client'

import React from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { login, initializeDefaultAdmin } from '@/lib/store'
import { AuthSession } from '@/lib/types'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Droplets } from 'lucide-react'

interface LoginFormProps {
  onLoginSuccess: (session: AuthSession | { userType: string }) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    initializeDefaultAdmin()

    await new Promise(resolve => setTimeout(resolve, 500))

    const result = login(email, password)
    
    if (result.success && result.session) {
      onLoginSuccess(result.session)
    } else {
      setError(result.error || 'Error al iniciar sesion')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <header className="bg-secondary py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Droplets className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary-foreground tracking-tight">GOTA</h1>
            <p className="text-xs text-secondary-foreground/80 -mt-1 italic">a gota</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-secondary-foreground/80">Sistema de Control</p>
          <p className="text-sm font-semibold text-secondary-foreground">Cobranzas</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Login Card */}
          <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border-4 border-secondary">
            <div className="bg-secondary py-4 px-6">
              <h2 className="text-xl font-bold text-secondary-foreground text-center">Iniciar Sesion</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Correo electronico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-2 border-primary/30 bg-muted focus:border-primary text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Contrasena
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contrasena"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl border-2 border-primary/30 bg-muted focus:border-primary text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                      Ingresando...
                    </span>
                  ) : (
                    'INGRESAR'
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                <p className="text-sm font-bold text-foreground mb-3">Credenciales de prueba:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-card rounded-lg border border-border">
                    <span className="text-muted-foreground font-medium">Oficina:</span>
                    <div className="text-right">
                      <p className="font-mono text-foreground text-xs">chito</p>
                      <p className="font-mono text-foreground text-xs">cobranzas</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Los cobradores usan su correo y contrasena asignados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/20 py-3 text-center">
        <p className="text-sm text-primary-foreground/80">
          Sistema de gestion de cobranzas y prestamos
        </p>
      </footer>
    </div>
  )
}
