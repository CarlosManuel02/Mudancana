// =====================================================
// CONFIGURACIÓN DE BASE DE DATOS
// =====================================================
// Este archivo contiene las funciones para interactuar con la base de datos.
// Debes reemplazar la implementación con tu cliente de base de datos preferido
// (PostgreSQL, MySQL, Supabase, etc.)

import type {
  User,
  Client,
  Service,
  ServiceType,
  Reminder,
  Setting,
  ServiceWithClient,
  ReminderWithClient,
  CreateClientInput,
  UpdateClientInput,
  CreateServiceInput,
  UpdateServiceInput,
  CreateReminderInput,
  UpdateReminderInput,
  DashboardStats,
  PaginatedResponse,
} from './types'

// =====================================================
// CONFIGURA TU CONEXIÓN A LA BASE DE DATOS AQUÍ
// =====================================================
// Ejemplo con pg (PostgreSQL):
// import { Pool } from 'pg'
// const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// Instala dependencias si usarás pg: npm i pg && npm i -D @types/pg
//
// Ejemplo con Supabase:
import {createClient} from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)


// =====================================================
// =====================================================
const users: User[] = []
const clients: Client[] = []
const serviceTypes: ServiceType[] = []
const services: Service[] = []
const reminders: Reminder[] = []
const settings: Setting[] = []

// =====================================================
// FUNCIONES DE USUARIOS
// =====================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  // 1. Limpiamos el email de espacios en blanco
  const cleanEmail = email.trim().toLowerCase();

  const {data, error} = await supabase
    .from('users')
    .select('*')
    .eq('email', cleanEmail)
    .single();

  if (error) {
    // ESTO TE DIRÁ POR QUÉ NO DEVUELVE NADA
    console.error("Error en Supabase:", error.message, error.details);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  // TODO: Reemplazar con query real
  const {data, error} = await supabase.from('users').select('*').eq('id', id).single()
  if (error || !data) {
    return null
  }
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function getUserPasswordHash(email: string): Promise<string | null> {
  // TODO: Reemplazar con query real
  const {data, error} = await supabase.from('users').select('password_hash').eq('email', email).single()
  if (error || !data) {
    return null
  }
  return data.password_hash
}

// =====================================================
// FUNCIONES DE CLIENTES
// =====================================================

export async function getClients(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Client>> {
  // TODO: Reemplazar con query real con paginación
  let filtered = [...clients]

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone.includes(search) ||
      c.city?.toLowerCase().includes(searchLower)
    )
  }

  const total = filtered.length
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit)
  console.log(`Obteniendo clientes: page=${page}, limit=${limit}, search="${search}", total=${total}`)
  console.log("Clientes filtrados:", data)

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  // TODO: Reemplazar con query real
  return clients.find(c => c.id === id) || null
}

export async function createNewClient(input: CreateClientInput, userId: string): Promise<Client> {
  const clientToInsert = {
    ...input,
    email: input.email || null,
    whatsapp: input.whatsapp || null,
    address: input.address || null,
    city: input.city || null,
    notes: input.notes || null,
    created_by: userId
  }
  console.log("Intentando crear cliente en Supabase con datos:", clientToInsert)

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientToInsert])
      .select()
      .single()

    if (error) throw error

    if (data) clients.push(data)

    return data as Client
  } catch (error: any) {
    console.error("Error al crear cliente en Supabase:", error.message || error)
    throw new Error("No se pudo crear el cliente")
  }
}

export async function updateClient(input: UpdateClientInput): Promise<Client | null> {
  // TODO: Reemplazar con UPDATE real
  const index = clients.findIndex(c => c.id === input.id)
  if (index === -1) return null

  try {
    const updatedClient = {
      ...clients[index],
      ...input,
      email: input.email || clients[index].email,
      whatsapp: input.whatsapp || clients[index].whatsapp,
      address: input.address || clients[index].address,
      city: input.city || clients[index].city,
      notes: input.notes || clients[index].notes,
      updated_at: new Date().toISOString(),
    }

    const result = await supabase.from('clients').update(updatedClient).eq('id', input.id).single()

    return result.data;

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al actualizar cliente en Supabase:", error.message)
    } else {
      console.error("Error al actualizar cliente en Supabase:", error)
    }
    throw new Error("No se pudo actualizar el cliente")
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  // TODO: Reemplazar con DELETE real
  const index = clients.findIndex(c => c.id === id)
  if (index === -1) return false
  try {
    const result = await supabase.from('clients').delete().eq('id', id).single()
    if (result.error) {
      console.error("Error al eliminar cliente en Supabase:", result.error.message, result.error.details)
      return false
    }
    clients.splice(index, 1)
    return true
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al eliminar cliente en Supabase:", error.message)
    } else {
      console.error("Error al eliminar cliente en Supabase:", error)
    }
    throw new Error("No se pudo eliminar el cliente")
  }
}

// =====================================================
// FUNCIONES DE SERVICIOS
// =====================================================

export async function getServices(page = 1, limit = 10, clientId?: string, status?: string): Promise<PaginatedResponse<ServiceWithClient>> {
  // TODO: Reemplazar con query real con JOIN a clients
  let filtered = [...services]

  if (clientId) {
    filtered = filtered.filter(s => s.client_id === clientId)
  }

  if (status) {
    filtered = filtered.filter(s => s.status === status)
  }

  const total = filtered.length
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit).map(s => ({
    ...s,
    client: clients.find(c => c.id === s.client_id)!,
    service_type: serviceTypes.find(st => st.id === s.service_type_id),
  }))

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getServiceById(id: string): Promise<ServiceWithClient | null> {
  // TODO: Reemplazar con query real
  const service = services.find(s => s.id === id)
  if (!service) return null

  return {
    ...service,
    client: clients.find(c => c.id === service.client_id)!,
    service_type: serviceTypes.find(st => st.id === service.service_type_id),
  }
}

export async function getServicesByClientId(clientId: string): Promise<Service[]> {
  // TODO: Reemplazar con query real
  return services.filter(s => s.client_id === clientId)
}

export async function createService(input: CreateServiceInput, userId: string): Promise<Service> {
  // TODO: Reemplazar con INSERT real
  const newService: Service = {
    id: String(services.length + 1),
    ...input,
    service_type_id: input.service_type_id || null,
    origin_city: input.origin_city || null,
    destination_city: input.destination_city || null,
    next_service_date: input.next_service_date || null,
    price: input.price || null,
    status: input.status || 'scheduled',
    notes: input.notes || null,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  services.push(newService)
  return newService
}

export async function updateService(input: UpdateServiceInput): Promise<Service | null> {
  // TODO: Reemplazar con UPDATE real
  const index = services.findIndex(s => s.id === input.id)
  if (index === -1) return null

  services[index] = {
    ...services[index],
    ...input,
    updated_at: new Date().toISOString(),
  }
  return services[index]
}

export async function deleteService(id: string): Promise<boolean> {
  // TODO: Reemplazar con DELETE real
  const index = services.findIndex(s => s.id === id)
  if (index === -1) return false
  services.splice(index, 1)
  return true
}

export async function getServiceTypes(): Promise<ServiceType[]> {
  // TODO: Reemplazar con query real
  return serviceTypes.filter(st => st.is_active)
}

export async function getUpcomingServices(days = 30): Promise<ServiceWithClient[]> {
  // TODO: Reemplazar con query real
  const today = new Date()
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

  return services
    .filter(s => {
      const serviceDate = new Date(s.service_date)
      return serviceDate >= today && serviceDate <= futureDate && s.status === 'scheduled'
    })
    .map(s => ({
      ...s,
      client: clients.find(c => c.id === s.client_id)!,
      service_type: serviceTypes.find(st => st.id === s.service_type_id),
    }))
    .sort((a, b) => new Date(a.service_date).getTime() - new Date(b.service_date).getTime())
}

// =====================================================
// FUNCIONES DE RECORDATORIOS
// =====================================================

export async function getReminders(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<ReminderWithClient>> {
  // TODO: Reemplazar con query real con JOIN
  let filtered = [...reminders]

  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }

  const total = filtered.length
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit).map(r => ({
    ...r,
    client: clients.find(c => c.id === r.client_id)!,
    service: services.find(s => s.id === r.service_id),
  }))

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getReminderById(id: string): Promise<ReminderWithClient | null> {
  // TODO: Reemplazar con query real
  const reminder = reminders.find(r => r.id === id)
  if (!reminder) return null

  return {
    ...reminder,
    client: clients.find(c => c.id === reminder.client_id)!,
    service: services.find(s => s.id === reminder.service_id),
  }
}

export async function getPendingReminders(): Promise<ReminderWithClient[]> {
  // TODO: Reemplazar con query real
  const today = new Date().toISOString().split('T')[0]

  return reminders
    .filter(r => r.status === 'pending' && r.reminder_date <= today)
    .map(r => ({
      ...r,
      client: clients.find(c => c.id === r.client_id)!,
      service: services.find(s => s.id === r.service_id),
    }))
}

export async function createReminder(input: CreateReminderInput, userId: string): Promise<Reminder> {
  // TODO: Reemplazar con INSERT real
  const newReminder: Reminder = {
    id: String(reminders.length + 1),
    ...input,
    service_id: input.service_id || null,
    message: input.message || null,
    send_email: input.send_email || false,
    send_whatsapp: input.send_whatsapp || false,
    status: 'pending',
    sent_at: null,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  reminders.push(newReminder)
  return newReminder
}

export async function updateReminder(input: UpdateReminderInput): Promise<Reminder | null> {
  // TODO: Reemplazar con UPDATE real
  const index = reminders.findIndex(r => r.id === input.id)
  if (index === -1) return null

  reminders[index] = {
    ...reminders[index],
    ...input,
    updated_at: new Date().toISOString(),
  }
  return reminders[index]
}

export async function deleteReminder(id: string): Promise<boolean> {
  // TODO: Reemplazar con DELETE real
  const index = reminders.findIndex(r => r.id === id)
  if (index === -1) return false
  reminders.splice(index, 1)
  return true
}

export async function markReminderAsSent(id: string): Promise<Reminder | null> {
  // TODO: Reemplazar con UPDATE real
  const index = reminders.findIndex(r => r.id === id)
  if (index === -1) return null

  reminders[index] = {
    ...reminders[index],
    status: 'sent',
    sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return reminders[index]
}

// =====================================================
// FUNCIONES DE DASHBOARD
// =====================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString()

  // 1. Obtener conteos totales (usando la tabla real si es posible)
  const { count: totalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  const { count: totalServices } = await supabase.from('services').select('*', { count: 'exact', head: true });

  // 2. Remitentes pendientes
  const { count: pendingReminders } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 3. Clientes recientes (CORRECCIÓN AQUÍ)
  const { data: recentClientsData, error } = await supabase
    .from('clients')
    .select('id, name, phone, email, city, created_at')
    .order('created_at', { ascending: false })
    .limit(5); // Eliminamos .single() porque queremos una lista

  if (error) {
    console.error("Error cargando clientes recientes:", error);
  }

  const upcomingServices = await getUpcomingServices(14);
  console.log(recentClientsData)

  return {
    totalClients: totalClients || 0,
    totalServices: totalServices || 0,
    pendingReminders: pendingReminders || 0,
    servicesThisMonth: 0, // Implementar query similar si es necesario
    upcomingServices,
    recentClients: recentClientsData || [], // Retornamos un array limpio de objetos cliente
  }
}

// =====================================================
// FUNCIONES DE CONFIGURACIÓN
// =====================================================

export async function getSettings(): Promise<Setting[]> {
  // TODO: Reemplazar con query real
  return []
}

export async function getSetting(key: string): Promise<string | null> {
  // TODO: Reemplazar con query real
  return null
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  // TODO: Reemplazar con UPDATE real
  return true
}
