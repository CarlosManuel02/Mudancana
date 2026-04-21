'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { reminderSchema, type ReminderInput } from '@/lib/validations'
import type { Reminder, Client } from '@/lib/types'

interface ReminderFormProps {
  reminder?: Reminder
  clients: Client[]
  onSubmit: (data: ReminderInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ReminderForm({ reminder, clients, onSubmit, onCancel, isLoading }: ReminderFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReminderInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      client_id: reminder?.client_id || '',
      title: reminder?.title || '',
      message: reminder?.message || '',
      reminder_date: reminder?.reminder_date || '',
      send_email: reminder?.send_email || false,
      send_whatsapp: reminder?.send_whatsapp || false,
    },
  })

  const watchClientId = watch('client_id')
  const watchSendEmail = watch('send_email')
  const watchSendWhatsapp = watch('send_whatsapp')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Cliente *</FieldLabel>
          <Select
            value={watchClientId}
            onValueChange={(value) => setValue('client_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.client_id && <FieldError>{errors.client_id.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="title">Título del recordatorio *</FieldLabel>
          <Input
            id="title"
            placeholder="Seguimiento de servicio..."
            {...register('title')}
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="message">Mensaje</FieldLabel>
          <Textarea
            id="message"
            placeholder="Detalles del recordatorio..."
            rows={3}
            {...register('message')}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="reminder_date">Fecha del recordatorio *</FieldLabel>
          <Input
            id="reminder_date"
            type="date"
            {...register('reminder_date')}
          />
          {errors.reminder_date && <FieldError>{errors.reminder_date.message}</FieldError>}
        </Field>

        <div className="space-y-3">
          <FieldLabel>Canales de notificación</FieldLabel>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={watchSendEmail}
                onCheckedChange={(checked) => setValue('send_email', checked as boolean)}
              />
              <span className="text-sm text-foreground">Enviar por Email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={watchSendWhatsapp}
                onCheckedChange={(checked) => setValue('send_whatsapp', checked as boolean)}
              />
              <span className="text-sm text-foreground">Enviar por WhatsApp</span>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Nota: Debes configurar los servicios de Email y WhatsApp en la sección de Configuración para que las notificaciones funcionen.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : reminder ? 'Actualizar' : 'Crear Recordatorio'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
