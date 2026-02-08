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
import { Plus, Pencil, Trash2, Search, Smartphone, Tablet, Bike, Banknote, FileText, Package } from 'lucide-react'
import { Collector, InventoryItem } from '@/lib/types'
import { 
  getCollectors,
  getInventory,
  saveInventoryItem,
  deleteInventoryItem,
  generateId 
} from '@/lib/store'

const itemTypeConfig = {
  tablet: { label: 'Tablet', icon: Tablet, color: 'text-primary' },
  phone: { label: 'Telefono', icon: Smartphone, color: 'text-accent' },
  motorcycle: { label: 'Motocicleta', icon: Bike, color: 'text-chart-3' },
  cash: { label: 'Efectivo', icon: Banknote, color: 'text-chart-1' },
  documents: { label: 'Documentos', icon: FileText, color: 'text-chart-5' },
  other: { label: 'Otro', icon: Package, color: 'text-muted-foreground' },
}

export function InventoryModule() {
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollector, setSelectedCollector] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    collectorId: '',
    itemType: '' as InventoryItem['itemType'] | '',
    description: '',
    serialNumber: '',
    notes: '',
    status: 'assigned' as InventoryItem['status'],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setCollectors(getCollectors())
    setInventory(getInventory())
  }

  const filteredInventory = inventory.filter(item => {
    const collector = collectors.find(c => c.id === item.collectorId)
    const matchesSearch = 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCollector = selectedCollector === 'all' || item.collectorId === selectedCollector
    return matchesSearch && matchesCollector
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.itemType) return

    const itemData: InventoryItem = {
      id: editingItem?.id || generateId(),
      collectorId: formData.collectorId,
      itemType: formData.itemType,
      description: formData.description,
      serialNumber: formData.serialNumber || undefined,
      assignedDate: editingItem?.assignedDate || new Date().toISOString(),
      status: formData.status,
      notes: formData.notes || undefined,
    }
    
    saveInventoryItem(itemData)
    loadData()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      collectorId: item.collectorId,
      itemType: item.itemType,
      description: item.description,
      serialNumber: item.serialNumber || '',
      notes: item.notes || '',
      status: item.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Esta seguro de eliminar este item del inventario?')) {
      deleteInventoryItem(id)
      loadData()
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      collectorId: '',
      itemType: '',
      description: '',
      serialNumber: '',
      notes: '',
      status: 'assigned',
    })
  }

  const getCollectorName = (collectorId: string) => {
    const collector = collectors.find(c => c.id === collectorId)
    return collector?.name || 'Sin asignar'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Group inventory by collector for summary
  const inventoryByCollector = collectors.map(collector => ({
    collector,
    items: inventory.filter(i => i.collectorId === collector.id && i.status === 'assigned'),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventario</h2>
          <p className="text-muted-foreground">Gestiona los recursos asignados a cobradores</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Nuevo Item de Inventario'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collector">Cobrador</Label>
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
              <div className="space-y-2">
                <Label htmlFor="itemType">Tipo de Item</Label>
                <Select
                  value={formData.itemType}
                  onValueChange={(value: InventoryItem['itemType']) => 
                    setFormData({ ...formData, itemType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(itemTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Samsung Galaxy Tab A8"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Numero de Serie (opcional)</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Ej: SN123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: InventoryItem['status']) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Asignado</SelectItem>
                    <SelectItem value="returned">Devuelto</SelectItem>
                    <SelectItem value="lost">Perdido/Danado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observaciones adicionales"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Actualizar' : 'Guardar'}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventoryByCollector.map(({ collector, items }) => (
          <Card key={collector.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{collector.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const config = itemTypeConfig[item.itemType]
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                    >
                      <config.icon className={`w-3 h-3 ${config.color}`} />
                      <span className="truncate max-w-[100px]">{item.description}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripcion o cobrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCollector} onValueChange={setSelectedCollector}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por cobrador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cobradores</SelectItem>
                {collectors.map((collector) => (
                  <SelectItem key={collector.id} value={collector.id}>
                    {collector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Cobrador</TableHead>
                <TableHead>Fecha Asignacion</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay items en el inventario
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => {
                  const config = itemTypeConfig[item.itemType]
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          <span>{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.serialNumber || '-'}
                      </TableCell>
                      <TableCell>{getCollectorName(item.collectorId)}</TableCell>
                      <TableCell>{formatDate(item.assignedDate)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'assigned' 
                            ? 'bg-accent/20 text-accent' 
                            : item.status === 'returned'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {item.status === 'assigned' ? 'Asignado' : 
                           item.status === 'returned' ? 'Devuelto' : 'Perdido'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
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
