'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { serviceSchema, type ServiceInput } from '@/lib/validations'
import type { Service, Client, ServiceType } from '@/lib/types'

interface ServiceFormProps {
  service?: Service
  clients: Client[]
  serviceTypes: ServiceType[]
  onSubmit: (data: ServiceInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ServiceForm({ service, clients, serviceTypes, onSubmit, onCancel, isLoading }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      client_id: service?.client_id || '',
      service_type_id: service?.service_type_id || '',
      origin_address: service?.origin_address || '',
      origin_city: service?.origin_city || '',
      destination_address: service?.destination_address || '',
      destination_city: service?.destination_city || '',
      service_date: service?.service_date || '',
      next_service_date: service?.next_service_date || '',
      price: service?.price || undefined,
      status: service?.status || 'scheduled',
      notes: service?.notes || '',
    },
  })

  const watchClientId = watch('client_id')
  const watchServiceTypeId = watch('service_type_id')
  const watchStatus = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
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
            <FieldLabel>Tipo de servicio</FieldLabel>
            <Select
              value={watchServiceTypeId}
              onValueChange={(value) => setValue('service_type_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="origin_address">Dirección de origen *</FieldLabel>
            <Input
              id="origin_address"
              placeholder="Calle Reforma 123, Centro"
              {...register('origin_address')}
            />
            {errors.origin_address && <FieldError>{errors.origin_address.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="origin_city">Ciudad de origen</FieldLabel>
            <Input
              id="origin_city"
              placeholder="Santo Domingo"
              {...register('origin_city')}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="destination_address">Dirección de destino *</FieldLabel>
            <Input
              id="destination_address"
              placeholder="Avenida Insurgentes 456, Roma"
              {...register('destination_address')}
            />
            {errors.destination_address && <FieldError>{errors.destination_address.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="destination_city">Ciudad de destino</FieldLabel>
            <Input
              id="destination_city"
              placeholder="Santiago"
              {...register('destination_city')}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="service_date">Fecha del servicio *</FieldLabel>
            <Input
              id="service_date"
              type="date"
              {...register('service_date')}
            />
            {errors.service_date && <FieldError>{errors.service_date.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="next_service_date">Próximo servicio</FieldLabel>
            <Input
              id="next_service_date"
              type="date"
              {...register('next_service_date')}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="price">Precio ($)</FieldLabel>
            <Input
              id="price"
              type="number"
              placeholder="15000"
              {...register('price')}
            />
            {errors.price && <FieldError>{errors.price.message}</FieldError>}
          </Field>
        </div>

        <Field>
          <FieldLabel>Estado</FieldLabel>
          <Select
            value={watchStatus}
            onValueChange={(value) => setValue('status', value as ServiceInput['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Programado</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Detalles adicionales del servicio..."
            rows={3}
            {...register('notes')}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : service ? 'Actualizar' : 'Crear Servicio'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
