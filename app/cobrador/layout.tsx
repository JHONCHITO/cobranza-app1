import React from "react"
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Gota a Gota - Cobrador',
  description: 'Panel del cobrador - Sistema Gota a Gota',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d9488',
}

export default function CobradorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
