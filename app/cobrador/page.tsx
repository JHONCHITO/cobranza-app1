'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CollectorApp } from '@/components/collector-app'
import { AuthSession } from '@/lib/types'
import { getCurrentSession, logout } from '@/lib/store'

export default function CobradorPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = getCurrentSession()
    if (!saved || saved.userType !== 'collector') {
      router.push('/')
      return
    }
    setSession(saved)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary-foreground font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return <CollectorApp session={session} onLogout={handleLogout} />
}
