// =====================================================
// CONFIGURACIÓN DE BASE DE DATOS
// =====================================================
// Este archivo contiene las funciones para interactuar con la base de datos.
// Debes reemplazar la implementación con tu cliente de base de datos preferido
// (PostgreSQL, MySQL, Supabase, etc.)

import type {
  Client,
  CreateClientInput,
  CreateReminderInput,
  CreateServiceInput,
  DashboardStats,
  PaginatedResponse,
  Reminder,
  ReminderWithClient,
  Service,
  ServiceType,
  ServiceWithClient,
  Setting,
  UpdateClientInput,
  UpdateReminderInput,
  UpdateServiceInput,
  User,
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
  let filtered = await supabase
    .from('clients')
    .select('*')
    .order('name', {ascending: true})
    .range(page - 1, page * limit - 1)
    .then(({data, error}) => {
      if (error) {
        console.error("Error al obtener clientes de Supabase:", error.message, error.details);
        return [];
      }
      return data || [];
    })

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

  clients.push(...filtered)
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getClientById(id: string): Promise<Client | null> {
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
    const {data, error} = await supabase
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

    clients[index] = updatedClient;
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
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Construimos la query con JOIN
  // 'client:client_id(*)' significa: trae los datos de la tabla vinculada por client_id
  let query = supabase
    .from('services')
    .select(`
      *,
      client:client_id (id, name, email, phone),
      service_type:service_type_id (id, name)
    `, {count: 'exact'});

  // 2. Aplicamos filtros de base de datos (no de JS)
  if (clientId) query = query.eq('client_id', clientId);
  if (status) query = query.eq('status', status);

  const {data, error, count} = await query
    .order('service_date', {ascending: false})
    .range(from, to);

  if (error) {
    console.error("Error en Supabase:", error.message);
    return {data: [], total: 0, page, limit, totalPages: 0};
  }
  services.push(...(data as Service[]))
  return {
    data: (data as any) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getServiceById(id: string): Promise<ServiceWithClient | null> {
  const result = await supabase.from('services').select('*').eq('id', id).single()
  if (result.error || !result.data) {
    return null
  }
  const service = result.data
  services.push(service)
  return {
    ...service,
    client: clients.find(c => c.id === service.client_id)!,
    service_type: serviceTypes.find(st => st.id === service.service_type_id),
  }
}

export async function getServicesByClientId(clientId: string): Promise<Service[]> {
  return services.filter(s => s.client_id === clientId)
}

export async function createService(input: CreateServiceInput, userId: string): Promise<Service> {
  const newService = {
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
  const result = await supabase.from('services').insert([newService]).select().single()
  if (result.error) {
    console.error("Error al crear servicio en Supabase:", result.error.message, result.error.details)
    throw new Error("No se pudo crear el servicio")
  }
  services.push(result.data as Service)
  return result.data as Service
}

export async function updateService(input: UpdateServiceInput): Promise<Service | null> {
  // 1. No busques en el array 'services'. Ve directo a Supabase.
  // Preparamos los datos para actualizar (quitamos el ID del cuerpo para no intentar sobrescribirlo)
  const {id, ...updateData} = input;

  const cleanData = Object.fromEntries(
    Object.entries(updateData).map(([key, value]) => [
      key,
      value === "" ? null : value
    ])
  );

  const dataToUpdate = {
    ...cleanData,
    updated_at: new Date().toISOString(),
  };


  // 2. Realizamos la actualización
  const {data, error} = await supabase
    .from('services')
    .update(dataToUpdate)
    .eq('id', id)
    .select() // Importante para que devuelva el objeto actualizado
    .single();

  if (error) {
    console.error("Error al actualizar servicio en Supabase:", error.message);
    // Si el error es que no existe la fila, retornamos null para el 404
    if (error.code === 'PGRST116') return null;
    throw new Error("No se pudo actualizar el servicio");
  }

  // 3. (Opcional) Si necesitas mantener el array local sincronizado
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    services[index] = data;
  } else {
    services.push(data);
  }

  return data as Service;
}

export async function deleteService(id: string): Promise<boolean> {
  const result = await supabase.from('services').delete().eq('id', id).single()
  if (result.error) {
    console.error("Error al eliminar servicio en Supabase:", result.error.message, result.error.details)
    return false
  }
  services.splice(services.findIndex(s => s.id === id), 1)
  return true
}

export async function getServiceTypes(): Promise<ServiceType[]> {
  const result = await supabase.from('service_types').select('*').order('name', {ascending: true})
  if (result.error) {
    console.error("Error al obtener tipos de servicio de Supabase:", result.error.message, result.error.details)
    return []
  }
  return result.data || []
}

export async function getUpcomingServices(days = 30): Promise<ServiceWithClient[]> {
  const today = new Date()
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

  const result = await supabase
    .from('services')
    .select(`
      *,  
      client:client_id (id, name, email, phone),
      service_type:service_type_id (id, name)
    `)
    .eq('status', 'scheduled')
    .gte('service_date', today.toISOString().split('T')[0])
    .lte('service_date', futureDate.toISOString().split('T')[0])
    .order('service_date', {ascending: true})

  if (result.error) {
    console.error("Error al obtener servicios próximos de Supabase:", result.error.message, result.error.details)
    return []
  }

  return (result.data as any[]).map(s => ({
    ...s,
    client: s.client,
    service_type: s.service_type,
  }))
}

// =====================================================
// FUNCIONES DE RECORDATORIOS
// =====================================================

export async function getReminders(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<ReminderWithClient>> {
  let filtered = await supabase
    .from('reminders')
    .select('*')
    .order('reminder_date', {ascending: false})
    .range(page - 1, page * limit - 1)
    .then(({data, error}) => {
      if (error) {
        console.error("Error al obtener recordatorios de Supabase:", error.message, error.details);
        return [];
      }
      return data || [];
    })


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
  reminders.push(...filtered)
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
  const today = new Date().toISOString().split('T')[0]

  const result = await supabase
    .from('reminders')
    .select('*')
    .eq('status', 'pending')
    .lte('reminder_date', today)
    .order('reminder_date', {ascending: true})
    .then(({data, error}) => {
      if (error) {
        console.error("Error al obtener recordatorios pendientes de Supabase:", error.message, error.details);
        return [];
      }
      return data || [];
    })

  return result.map(r => ({
    ...r,
    client: clients.find(c => c.id === r.client_id)!,
    service: services.find(s => s.id === r.service_id),
  }))
}

export async function createReminder(input: CreateReminderInput, userId: string): Promise<Reminder> {
  // TODO: Reemplazar con INSERT real
  const newReminder = {
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

  const result = await supabase.from('reminders').insert([newReminder]).select().single()
  if (result.error) {
    console.error("Error al crear recordatorio en Supabase:", result.error.message, result.error.details)
    throw new Error("No se pudo crear el recordatorio")
  }
  reminders.push(result.data as Reminder)
  return result.data as Reminder
}

export async function updateReminder(input: UpdateReminderInput): Promise<Reminder | null> {
  const index = reminders.findIndex(r => r.id === input.id)
  if (index === -1) return null

  const updatedReminder = {
    ...reminders[index],
    ...input,
    service_id: input.service_id || reminders[index].service_id,
    message: input.message || reminders[index].message,
    send_email: input.send_email !== undefined ? input.send_email : reminders[index].send_email,
    send_whatsapp: input.send_whatsapp !== undefined ? input.send_whatsapp : reminders[index].send_whatsapp,
    status: input.status || reminders[index].status,
    updated_at: new Date().toISOString(),
  }
  const result = await supabase.from('reminders').update(updatedReminder).eq('id', input.id).single()
  if (result.error) {
    console.error("Error al actualizar recordatorio en Supabase:", result.error.message, result.error.details)
    throw new Error("No se pudo actualizar el recordatorio")
  }
  reminders[index] = updatedReminder
  return result.data as Reminder;
}

export async function deleteReminder(id: string): Promise<boolean> {
  const index = reminders.findIndex(r => r.id === id)
  if (index === -1) return false
  const result = await supabase.from('reminders').delete().eq('id', id).single()
  if (result.error) {
    console.error("Error al eliminar recordatorio en Supabase:", result.error.message, result.error.details)
    return false
  }
  reminders.splice(index, 1)
  return true
}

export async function markReminderAsSent(id: string): Promise<Reminder | null> {
  // TODO: Reemplazar con UPDATE real
  const index = reminders.findIndex(r => r.id === id)
  if (index === -1) return null

  const updatedReminder: Reminder = {
    ...reminders[index],
    status: 'sent',
    sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const result = await supabase.from('reminders').update(updatedReminder).eq('id', id).single()
  if (result.error) {
    console.error("Error al marcar recordatorio como enviado en Supabase:", result.error.message, result.error.details)
    throw new Error("No se pudo actualizar el recordatorio")
  }
  reminders[index] = updatedReminder
  return result.data as Reminder;
}

// =====================================================
// FUNCIONES DE DASHBOARD
// =====================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString()

  // 1. Obtener conteos totales (usando la tabla real si es posible)
  const {count: totalClients} = await supabase.from('clients').select('*', {count: 'exact', head: true});
  const {count: totalServices} = await supabase.from('services').select('*', {count: 'exact', head: true});

  // 2. Remitentes pendientes
  const {count: pendingReminders} = await supabase
    .from('reminders')
    .select('*', {count: 'exact', head: true})
    .eq('status', 'pending');

  // 3. Clientes recientes (CORRECCIÓN AQUÍ)
  const {data: recentClientsData, error} = await supabase
    .from('clients')
    .select('id, name, phone, email, city, created_at')
    .order('created_at', {ascending: false})
    .limit(5); // Eliminamos .single() porque queremos una lista

  if (error) {
    console.error("Error cargando clientes recientes:", error);
  }

  const upcomingServices = await getUpcomingServices(14); // Próximos 14 días
  console.log(upcomingServices)

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
