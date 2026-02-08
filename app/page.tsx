'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { getCurrentSession } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = getCurrentSession()

    if (saved) {
      if (saved.userType === 'admin') {
        router.push('/oficina')
      } else {
        router.push('/cobrador')
      }
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleLoginSuccess = (session: { userType: string }) => {
    if (session.userType === 'admin') {
      router.push('/oficina')
    } else {
      router.push('/cobrador')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <p className="text-primary-foreground font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}
