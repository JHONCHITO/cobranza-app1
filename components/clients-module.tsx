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
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Client, Collector } from '@/lib/types'
import { 
  getClients, 
  saveClient, 
  deleteClient, 
  getCollectors,
  generateId 
} from '@/lib/store'

interface ClientsModuleProps {
  collectorFilter?: string
  readOnly?: boolean
}

export function ClientsModule({ collectorFilter, readOnly = false }: ClientsModuleProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    cedula: '',
    email: '',
    collectorId: '',
    status: 'active' as const,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    let allClients = getClients()
    if (collectorFilter) {
      allClients = allClients.filter(c => c.collectorId === collectorFilter)
    }
    setClients(allClients)
    setCollectors(getCollectors())
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cedula.includes(searchTerm) ||
    client.phone.includes(searchTerm)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clientData: Client = {
      id: editingClient?.id || generateId(),
      ...formData,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    }
    saveClient(clientData)
    loadData()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      address: client.address,
      cedula: client.cedula,
      email: client.email || '',
      collectorId: client.collectorId,
      status: client.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Esta seguro de eliminar este cliente?')) {
      deleteClient(id)
      loadData()
    }
  }

  const resetForm = () => {
    setEditingClient(null)
    setFormData({
      name: '',
      phone: '',
      address: '',
      cedula: '',
      email: '',
      collectorId: '',
      status: 'active',
    })
  }

  const getCollectorName = (collectorId: string) => {
    const collector = collectors.find(c => c.id === collectorId)
    return collector?.name || 'Sin asignar'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {collectorFilter ? 'Mis Clientes' : 'Clientes'}
          </h2>
          <p className="text-muted-foreground">Gestiona los clientes del sistema</p>
        </div>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Direccion</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                {!collectorFilter && (
                  <div className="space-y-2">
                    <Label htmlFor="collector">Cobrador Asignado</Label>
                    <Select
                      value={formData.collectorId}
                      onValueChange={(value) => setFormData({ ...formData, collectorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cobrador" />
                      </SelectTrigger>
                      <SelectContent>
                        {collectors.map((collector) => (
                          <SelectItem key={collector.id} value={collector.id}>
                            {collector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    {editingClient ? 'Actualizar' : 'Guardar'}
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
        )}
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
              {filteredClients.length} clientes encontrados
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
                <TableHead>Direccion</TableHead>
                {!collectorFilter && <TableHead>Cobrador</TableHead>}
                <TableHead>Estado</TableHead>
                {!readOnly && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={collectorFilter ? 6 : 7} className="text-center py-8 text-muted-foreground">
                    No hay clientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.cedula}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{client.address}</TableCell>
                    {!collectorFilter && (
                      <TableCell>{getCollectorName(client.collectorId)}</TableCell>
                    )}
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'active' 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    {!readOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(client)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
