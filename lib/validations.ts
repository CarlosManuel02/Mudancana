import {z} from 'zod'

// =====================================================
// ESQUEMAS DE VALIDACIÓN
// =====================================================

// Autenticación
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

// Usuarios
export const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'employee']),
})

// Clientes
export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
  whatsapp: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const updateClientSchema = clientSchema.partial().extend({
  id: z.string(),
})

// Servicios
export const serviceSchema = z.object({
  client_id: z.string().min(1, 'El cliente es requerido'),
  service_type_id: z.string().optional(),
  origin_address: z.string().min(5, 'La dirección de origen es requerida'),
  origin_city: z.string().optional().or(z.literal('')),
  destination_address: z.string().min(5, 'La dirección de destino es requerida'),
  destination_city: z.string().optional().or(z.literal('')),
  service_date: z.string().min(1, 'La fecha del servicio es requerida'),
  next_service_date: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional().or(z.literal('')),
})

export const updateServiceSchema = serviceSchema.partial().extend({
  id: z.string(),
})

// Recordatorios
export const reminderSchema = z.object({
  client_id: z.string().min(1, 'El cliente es requerido'),
  service_id: z.string().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  message: z.string().optional().or(z.literal('')),
  reminder_date: z.string().min(1, 'La fecha del recordatorio es requerida'),
  send_email: z.boolean().optional(),
  send_whatsapp: z.boolean().optional(),
})

export const updateReminderSchema = reminderSchema.partial().extend({
  id: z.string(),
  status: z.enum(['pending', 'sent', 'dismissed']).optional(),
})

// Configuración
export const settingSchema = z.object({
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null()
  ]).optional(),
  description: z.string().optional()
})


// Tipos inferidos
export type LoginInput = z.infer<typeof loginSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type ReminderInput = z.infer<typeof reminderSchema>
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>
