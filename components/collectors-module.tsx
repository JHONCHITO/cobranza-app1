'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Search, Users, Wallet } from 'lucide-react'
import { Collector } from '@/lib/types'
import { 
  getCollectors, 
  saveCollector, 
  deleteCollector,
  getClientsByCollector,
  getCollectorStats,
  generateId 
} from '@/lib/store'

export function CollectorsModule() {
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCollector, setEditingCollector] = useState<Collector | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    cedula: '',
    zone: '',
    status: 'active' as const,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setCollectors(getCollectors())
  }

  const filteredCollectors = collectors.filter(collector =>
    collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.cedula.includes(searchTerm) ||
    collector.phone.includes(searchTerm)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const collectorData: Collector = {
      id: editingCollector?.id || generateId(),
      ...formData,
      createdAt: editingCollector?.createdAt || new Date().toISOString(),
    }
    saveCollector(collectorData)
    loadData()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (collector: Collector) => {
    setEditingCollector(collector)
    setFormData({
      name: collector.name,
      phone: collector.phone,
      email: collector.email,
      password: collector.password,
      cedula: collector.cedula,
      zone: collector.zone,
      status: collector.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const clients = getClientsByCollector(id)
    if (clients.length > 0) {
      alert(`No se puede eliminar. Este cobrador tiene ${clients.length} cliente(s) asignado(s).`)
      return
    }
    if (confirm('Esta seguro de eliminar este cobrador?')) {
      deleteCollector(id)
      loadData()
    }
  }

  const resetForm = () => {
    setEditingCollector(null)
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      cedula: '',
      zone: '',
      status: 'active',
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cobradores</h2>
          <p className="text-muted-foreground">Gestiona los cobradores del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Cobrador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCollector ? 'Editar Cobrador' : 'Nuevo Cobrador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula">Cedula</Label>
                <Input
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (para iniciar sesion)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena (para iniciar sesion)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zona de Trabajo</Label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ej: Norte, Sur, Centro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCollector ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cedula o telefono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredCollectors.length} cobradores encontrados
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cedula</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Cartera</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay cobradores registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollectors.map((collector) => {
                  const stats = getCollectorStats(collector.id)
                  return (
                    <TableRow key={collector.id}>
                      <TableCell className="font-medium">{collector.name}</TableCell>
                      <TableCell>{collector.cedula}</TableCell>
                      <TableCell>{collector.phone}</TableCell>
                      <TableCell>{collector.zone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {stats.totalClients}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          {formatCurrency(stats.totalPortfolio)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          collector.status === 'active' 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {collector.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(collector)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(collector.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
