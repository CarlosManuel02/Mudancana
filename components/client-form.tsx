'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { clientSchema, type ClientInput } from '@/lib/validations'
import type { Client } from '@/lib/types'

interface ClientFormProps {
  client?: Client
  onSubmit: (data: ClientInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ClientForm({ client, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      whatsapp: client?.whatsapp || '',
      address: client?.address || '',
      city: client?.city || '',
      notes: client?.notes || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">Nombre completo *</FieldLabel>
            <Input
              id="name"
              placeholder="Juan Pérez"
              {...register('name')}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="juan@email.com"
              {...register('email')}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="phone">Teléfono *</FieldLabel>
            <Input
              id="phone"
              placeholder="+52 55 1234 5678"
              {...register('phone')}
            />
            {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
            <Input
              id="whatsapp"
              placeholder="+52 55 1234 5678"
              {...register('whatsapp')}
            />
            {errors.whatsapp && <FieldError>{errors.whatsapp.message}</FieldError>}
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="address">Dirección</FieldLabel>
            <Input
              id="address"
              placeholder="Av. Reforma 123, Col. Centro"
              {...register('address')}
            />
            {errors.address && <FieldError>{errors.address.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="city">Ciudad</FieldLabel>
            <Input
              id="city"
              placeholder="Ciudad de México"
              {...register('city')}
            />
            {errors.city && <FieldError>{errors.city.message}</FieldError>}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Información adicional sobre el cliente..."
            rows={3}
            {...register('notes')}
          />
          {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
        </Field>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : client ? 'Actualizar' : 'Crear Cliente'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
