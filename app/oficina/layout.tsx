import React from "react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gota a Gota - Oficina',
  description: 'Panel de administracion - Sistema Gota a Gota',
}

export default function OficinaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
