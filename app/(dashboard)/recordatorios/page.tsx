'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { 
  Plus, 
  Bell, 
  Calendar,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Filter,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReminderForm } from '@/components/reminder-form'
import type { Reminder, ReminderWithClient, Client, PaginatedResponse } from '@/lib/types'
import type { ReminderInput } from '@/lib/validations'
import { format, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  sent: 'bg-success/10 text-success border-success/20',
  dismissed: 'bg-muted text-muted-foreground border-muted',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  sent: 'Enviado',
  dismissed: 'Descartado',
}

export default function RecordatoriosPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [deletingReminder, setDeletingReminder] = useState<ReminderWithClient | null>(null)
  const [markingAsSent, setMarkingAsSent] = useState<ReminderWithClient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<{ 
    success: boolean
  } & PaginatedResponse<ReminderWithClient>>(
    `/api/reminders?page=${page}&limit=10${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`,
    fetcher
  )

  const { data: clientsData } = useSWR<{ success: boolean } & PaginatedResponse<Client>>(
    '/api/clients?limit=100',
    fetcher
  )

  const handleCreate = () => {
    setEditingReminder(null)
    setIsFormOpen(true)
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setIsFormOpen(true)
  }

  const handleSubmit = async (formData: ReminderInput) => {
    setIsSubmitting(true)

    try {
      const url = editingReminder ? `/api/reminders/${editingReminder.id}` : '/api/reminders'
      const method = editingReminder ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsFormOpen(false)
        setEditingReminder(null)
        mutate()
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingReminder) return

    try {
      const response = await fetch(`/api/reminders/${deletingReminder.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDeletingReminder(null)
        mutate()
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const handleMarkAsSent = async () => {
    if (!markingAsSent) return

    try {
      const response = await fetch(`/api/reminders/${markingAsSent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsSent: true }),
      })

      if (response.ok) {
        setMarkingAsSent(null)
        mutate()
      }
    } catch (error) {
      console.error('Error marking reminder as sent:', error)
    }
  }

  const getReminderUrgency = (date: string) => {
    const reminderDate = new Date(date)
    if (isPast(reminderDate) && !isToday(reminderDate)) {
      return 'urgent'
    }
    if (isToday(reminderDate)) {
      return 'today'
    }
    return 'normal'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recordatorios</h1>
          <p className="text-muted-foreground">Gestiona los recordatorios de seguimiento</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Recordatorio
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="sent">Enviados</SelectItem>
                <SelectItem value="dismissed">Descartados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de recordatorios */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar los recordatorios</p>
          </CardContent>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No hay recordatorios</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter !== 'all' ? 'No hay recordatorios con este estado' : 'Comienza creando tu primer recordatorio'}
            </p>
            {statusFilter === 'all' && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Recordatorio
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((reminder) => {
            const urgency = getReminderUrgency(reminder.reminder_date)
            return (
              <Card 
                key={reminder.id} 
                className={`border-border hover:shadow-md transition-shadow ${
                  urgency === 'urgent' && reminder.status === 'pending' ? 'border-l-4 border-l-destructive' : 
                  urgency === 'today' && reminder.status === 'pending' ? 'border-l-4 border-l-warning' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 ${
                        reminder.status === 'sent' ? 'bg-success/10 text-success' :
                        urgency === 'urgent' ? 'bg-destructive/10 text-destructive' :
                        urgency === 'today' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {reminder.status === 'sent' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Bell className="w-6 h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{reminder.title}</h3>
                          <Badge className={statusColors[reminder.status]}>
                            {statusLabels[reminder.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cliente: <span className="text-foreground">{reminder.client.name}</span>
                        </p>
                        {reminder.message && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {reminder.message}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(reminder.reminder_date), "d 'de' MMM, yyyy", { locale: es })}</span>
                            {urgency === 'urgent' && reminder.status === 'pending' && (
                              <Badge variant="destructive" className="ml-2 text-xs">Vencido</Badge>
                            )}
                            {urgency === 'today' && reminder.status === 'pending' && (
                              <Badge className="ml-2 text-xs bg-warning/10 text-warning">Hoy</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {reminder.send_email && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Badge>
                            )}
                            {reminder.send_whatsapp && (
                              <Badge variant="outline" className="text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                WhatsApp
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {reminder.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => setMarkingAsSent(reminder)}>
                              <Send className="w-4 h-4 mr-2" />
                              Marcar como enviado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(reminder)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingReminder(reminder)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal de formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
            </DialogTitle>
            <DialogDescription>
              {editingReminder
                ? 'Actualiza la información del recordatorio'
                : 'Crea un nuevo recordatorio de seguimiento'}
            </DialogDescription>
          </DialogHeader>
          <ReminderForm
            reminder={editingReminder || undefined}
            clients={clientsData?.data || []}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog open={!!deletingReminder} onOpenChange={() => setDeletingReminder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar recordatorio</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este recordatorio? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación de marcar como enviado */}
      <AlertDialog open={!!markingAsSent} onOpenChange={() => setMarkingAsSent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como enviado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmas que ya enviaste este recordatorio a {markingAsSent?.client.name}? Esto actualizará el estado del recordatorio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsSent}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
