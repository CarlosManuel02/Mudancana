// =====================================================
// TIPOS DE DATOS - SISTEMA DE SEGUIMIENTO DE MUDANZAS
// =====================================================

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'employee'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  whatsapp: string | null
  address: string | null
  city: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ServiceType {
  id: string
  name: string
  description: string | null
  default_frequency_days: number
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  client_id: string
  service_type_id: string | null
  origin_address: string
  origin_city: string | null
  destination_address: string
  destination_city: string | null
  service_date: string
  next_service_date: string | null
  price: number | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ServiceWithClient extends Service {
  client: Client
  service_type?: ServiceType
}

export interface Reminder {
  id: string
  client_id: string
  service_id: string | null
  title: string
  message: string | null
  reminder_date: string
  send_email: boolean
  send_whatsapp: boolean
  status: 'pending' | 'sent' | 'dismissed'
  sent_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ReminderWithClient extends Reminder {
  client: Client
  service?: Service
}

export interface Setting {
  id: string
  key: string
  value: string | null
  description: string | null
  updated_at: string
}

// Tipos para formularios
export interface CreateClientInput {
  name: string
  email?: string
  phone: string
  whatsapp?: string
  address?: string
  city?: string
  notes?: string
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string
}

export interface CreateServiceInput {
  client_id: string
  service_type_id?: string
  origin_address: string
  origin_city?: string
  destination_address: string
  destination_city?: string
  service_date: string
  next_service_date?: string
  price?: number
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string
}

export interface CreateReminderInput {
  client_id: string
  service_id?: string
  title: string
  message?: string
  reminder_date: string
  send_email?: boolean
  send_whatsapp?: boolean
}

export interface UpdateReminderInput extends Partial<CreateReminderInput> {
  id: string
  status?: 'pending' | 'sent' | 'dismissed'
}

// Tipos para autenticación
export interface LoginInput {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'employee'
}

export interface Session {
  user: AuthUser
  token: string
  expires_at: string
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  totalClients: number
  totalServices: number
  pendingReminders: number
  servicesThisMonth: number
  upcomingServices: ServiceWithClient[]
  recentClients: Client[]
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
