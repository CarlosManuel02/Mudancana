'use client'

import {useEffect, useState} from 'react'
import useSWR from 'swr'
import { 
  Settings, 
  Building2, 
  Mail, 
  MessageSquare, 
  Database,
  Shield,
  Bell,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

const fetcher = (url:string) => fetch(url).then(r => r.json())

export default function ConfiguracionPage() {
  const [companySettings, setCompanySettings] = useState({
    name: 'Mi Empresa de Mudanzas',
    email: '',
    phone: '',
    address: '',
  })

  const [reminderSettings, setReminderSettings] = useState({
    daysBefore: 7,
    emailEnabled: false,
    whatsappEnabled: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  const { data, mutate } = useSWR('/api/settings', fetcher)

  useEffect(() => {
    if (!data?.data) return

    const map = Object.fromEntries(
      data.data.map((item:any) => [item.key, item.value])
    )

    setCompanySettings({
      name: map.company_name || '',
      email: map.company_email || '',
      phone: map.company_phone || '',
      address: map.company_address || '',
    })

    setReminderSettings({
      daysBefore: Number(map.reminder_days_before || 7),
      emailEnabled: map.email_enabled === 'true',
      whatsappEnabled: map.whatsapp_enabled === 'true',
    })
  }, [data])

  const handleSaveCompany = async () => {
    setIsSaving(true)

    const entries = [
      ['company_name', companySettings.name],
      ['company_email', companySettings.email],
      ['company_phone', companySettings.phone],
      ['company_address', companySettings.address],
    ]

    await Promise.all(
      entries.map(([key, value]) =>
        fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        })
      )
    )

    mutate()
    setIsSaving(false)
  }

  const handleSaveReminders = async () => {
    setIsSaving(true)

    const entries = [
      ['reminder_days_before', reminderSettings.daysBefore],
      ['email_enabled', reminderSettings.emailEnabled],
      ['whatsapp_enabled', reminderSettings.whatsappEnabled],
    ]

    await Promise.all(
      entries.map(([key, value]) =>
        fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        })
      )
    )

    mutate()
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="recordatorios" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Recordatorios</span>
          </TabsTrigger>
          {/*<TabsTrigger value="integraciones" className="flex items-center gap-2">*/}
          {/*  <Database className="w-4 h-4" />*/}
          {/*  <span className="hidden sm:inline">Integraciones</span>*/}
          {/*</TabsTrigger>*/}
          {/*<TabsTrigger value="seguridad" className="flex items-center gap-2">*/}
          {/*  <Shield className="w-4 h-4" />*/}
          {/*  <span className="hidden sm:inline">Seguridad</span>*/}
          {/*</TabsTrigger>*/}
        </TabsList>

        {/* Configuración de empresa */}
        <TabsContent value="empresa">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Información de la Empresa
              </CardTitle>
              <CardDescription>
                Configura los datos básicos de tu empresa que se mostrarán en las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="company-name">Nombre de la empresa</FieldLabel>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mi Empresa de Mudanzas"
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="company-email">Email de contacto</FieldLabel>
                    <Input
                      id="company-email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contacto@empresa.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="company-phone">Teléfono</FieldLabel>
                    <Input
                      id="company-phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+52 55 1234 5678"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="company-address">Dirección</FieldLabel>
                  <Textarea
                    id="company-address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Dirección de la empresa..."
                    rows={2}
                  />
                </Field>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveCompany} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de recordatorios */}
        <TabsContent value="recordatorios">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Configuración de Recordatorios
              </CardTitle>
              <CardDescription>
                Personaliza cómo y cuándo se envían los recordatorios a los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="days-before">Días antes del servicio para enviar recordatorio</FieldLabel>
                  <Input
                    id="days-before"
                    type="number"
                    min={1}
                    max={30}
                    value={reminderSettings.daysBefore}
                    onChange={(e) => setReminderSettings(prev => ({ ...prev, daysBefore: parseInt(e.target.value) || 7 }))}
                    className="w-32"
                  />
                </Field>

                <div className="space-y-4">
                  <FieldLabel>Canales de notificación</FieldLabel>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Notificaciones por Email</p>
                        <p className="text-sm text-muted-foreground">Enviar recordatorios automáticos por correo electrónico</p>
                      </div>
                    </div>
                    <Switch
                      checked={reminderSettings.emailEnabled}
                      onCheckedChange={(checked) => setReminderSettings(prev => ({ ...prev, emailEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10 text-success">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Notificaciones por WhatsApp</p>
                        <p className="text-sm text-muted-foreground">Enviar recordatorios automáticos por WhatsApp Business</p>
                      </div>
                    </div>
                    <Switch
                      checked={reminderSettings.whatsappEnabled}
                      onCheckedChange={(checked) => setReminderSettings(prev => ({ ...prev, whatsappEnabled: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveReminders} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/*/!* Integraciones *!/*/}
        {/*<TabsContent value="integraciones">*/}
        {/*  <div className="grid gap-6">*/}
        {/*    /!* Email *!/*/}
        {/*    <Card className="border-border">*/}
        {/*      <CardHeader>*/}
        {/*        <div className="flex items-center justify-between">*/}
        {/*          <div className="flex items-center gap-3">*/}
        {/*            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">*/}
        {/*              <Mail className="w-5 h-5" />*/}
        {/*            </div>*/}
        {/*            <div>*/}
        {/*              <CardTitle className="text-lg">Servicio de Email</CardTitle>*/}
        {/*              <CardDescription>*/}
        {/*                Configura tu proveedor de email para enviar notificaciones*/}
        {/*              </CardDescription>*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <Badge variant="outline">No configurado</Badge>*/}
        {/*        </div>*/}
        {/*      </CardHeader>*/}
        {/*      <CardContent>*/}
        {/*        <div className="p-4 bg-muted/50 rounded-lg">*/}
        {/*          <p className="text-sm text-muted-foreground mb-3">*/}
        {/*            Para habilitar el envío de emails, debes configurar las siguientes variables de entorno:*/}
        {/*          </p>*/}
        {/*          <div className="space-y-2 font-mono text-xs">*/}
        {/*            <p className="p-2 bg-background rounded"><code>SMTP_HOST=smtp.ejemplo.com</code></p>*/}
        {/*            <p className="p-2 bg-background rounded"><code>SMTP_PORT=587</code></p>*/}
        {/*            <p className="p-2 bg-background rounded"><code>SMTP_USER=tu-usuario</code></p>*/}
        {/*            <p className="p-2 bg-background rounded"><code>SMTP_PASSWORD=tu-contraseña</code></p>*/}
        {/*            <p className="p-2 bg-background rounded"><code>EMAIL_FROM=noreply@tuempresa.com</code></p>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      </CardContent>*/}
        {/*    </Card>*/}

        {/*    /!* WhatsApp *!/*/}
        {/*    <Card className="border-border">*/}
        {/*      <CardHeader>*/}
        {/*        <div className="flex items-center justify-between">*/}
        {/*          <div className="flex items-center gap-3">*/}
        {/*            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10 text-success">*/}
        {/*              <MessageSquare className="w-5 h-5" />*/}
        {/*            </div>*/}
        {/*            <div>*/}
        {/*              <CardTitle className="text-lg">WhatsApp Business API</CardTitle>*/}
        {/*              <CardDescription>*/}
        {/*                Conecta tu cuenta de WhatsApp Business para enviar mensajes*/}
        {/*              </CardDescription>*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <Badge variant="outline">No configurado</Badge>*/}
        {/*        </div>*/}
        {/*      </CardHeader>*/}
        {/*      <CardContent>*/}
        {/*        <div className="p-4 bg-muted/50 rounded-lg">*/}
        {/*          <p className="text-sm text-muted-foreground mb-3">*/}
        {/*            Para habilitar WhatsApp, necesitas una cuenta de Meta Business y configurar:*/}
        {/*          </p>*/}
        {/*          <div className="space-y-2 font-mono text-xs">*/}
        {/*            <p className="p-2 bg-background rounded"><code>WHATSAPP_TOKEN=tu-access-token</code></p>*/}
        {/*            <p className="p-2 bg-background rounded"><code>WHATSAPP_PHONE_ID=tu-phone-number-id</code></p>*/}
        {/*            <p className="p-2 bg-background rounded"><code>WHATSAPP_BUSINESS_ID=tu-business-account-id</code></p>*/}
        {/*          </div>*/}
        {/*          <p className="text-xs text-muted-foreground mt-3">*/}
        {/*            Consulta la documentación de Meta para obtener estos valores.*/}
        {/*          </p>*/}
        {/*        </div>*/}
        {/*      </CardContent>*/}
        {/*    </Card>*/}

        {/*    /!* Base de datos *!/*/}
        {/*    <Card className="border-border">*/}
        {/*      <CardHeader>*/}
        {/*        <div className="flex items-center justify-between">*/}
        {/*          <div className="flex items-center gap-3">*/}
        {/*            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">*/}
        {/*              <Database className="w-5 h-5" />*/}
        {/*            </div>*/}
        {/*            <div>*/}
        {/*              <CardTitle className="text-lg">Base de Datos</CardTitle>*/}
        {/*              <CardDescription>*/}
        {/*                Configuración de conexión a tu base de datos PostgreSQL*/}
        {/*              </CardDescription>*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*          <Badge variant="outline">Demo (Mock Data)</Badge>*/}
        {/*        </div>*/}
        {/*      </CardHeader>*/}
        {/*      <CardContent>*/}
        {/*        <div className="p-4 bg-muted/50 rounded-lg">*/}
        {/*          <p className="text-sm text-muted-foreground mb-3">*/}
        {/*            Actualmente el sistema usa datos de demostración. Para conectar a una base de datos real:*/}
        {/*          </p>*/}
        {/*          <div className="space-y-2 font-mono text-xs">*/}
        {/*            <p className="p-2 bg-background rounded"><code>DATABASE_URL=postgresql://user:pass@host:5432/db</code></p>*/}
        {/*          </div>*/}
        {/*          <p className="text-xs text-muted-foreground mt-3">*/}
        {/*            Ejecuta el script <code className="bg-background px-1 py-0.5 rounded">scripts/001-schema.sql</code> para crear las tablas necesarias.*/}
        {/*          </p>*/}
        {/*        </div>*/}
        {/*      </CardContent>*/}
        {/*    </Card>*/}
        {/*  </div>*/}
        {/*</TabsContent>*/}

        {/*/!* Seguridad *!/*/}
        {/*<TabsContent value="seguridad">*/}
        {/*  <Card className="border-border">*/}
        {/*    <CardHeader>*/}
        {/*      <CardTitle className="flex items-center gap-2">*/}
        {/*        <Shield className="w-5 h-5 text-primary" />*/}
        {/*        Seguridad y Acceso*/}
        {/*      </CardTitle>*/}
        {/*      <CardDescription>*/}
        {/*        Administra la configuración de seguridad del sistema*/}
        {/*      </CardDescription>*/}
        {/*    </CardHeader>*/}
        {/*    <CardContent>*/}
        {/*      <div className="space-y-6">*/}
        {/*        <div className="p-4 border border-border rounded-lg">*/}
        {/*          <div className="flex items-center justify-between mb-4">*/}
        {/*            <div>*/}
        {/*              <p className="font-medium text-foreground">Autenticación JWT</p>*/}
        {/*              <p className="text-sm text-muted-foreground">El sistema usa tokens JWT para autenticación</p>*/}
        {/*            </div>*/}
        {/*            <Badge className="bg-success/10 text-success">Activo</Badge>*/}
        {/*          </div>*/}
        {/*          <div className="p-3 bg-muted/50 rounded font-mono text-xs">*/}
        {/*            <code>JWT_SECRET=tu-clave-secreta-muy-larga-y-segura</code>*/}
        {/*          </div>*/}
        {/*          <p className="text-xs text-muted-foreground mt-2">*/}
        {/*            Importante: Cambia esta clave en producción por una clave segura y única.*/}
        {/*          </p>*/}
        {/*        </div>*/}

        {/*        <div className="p-4 border border-border rounded-lg">*/}
        {/*          <p className="font-medium text-foreground mb-2">Usuarios del sistema</p>*/}
        {/*          <p className="text-sm text-muted-foreground mb-4">*/}
        {/*            Para agregar más usuarios, ejecuta un INSERT en la tabla <code className="bg-muted px-1 py-0.5 rounded">users</code> de tu base de datos.*/}
        {/*          </p>*/}
        {/*          <div className="p-3 bg-muted/50 rounded font-mono text-xs overflow-x-auto">*/}
        {/*            <code>INSERT INTO users (email, password_hash, name, role) VALUES (&apos;nuevo@email.com&apos;, &apos;hash_bcrypt&apos;, &apos;Nombre&apos;, &apos;employee&apos;);</code>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </CardContent>*/}
        {/*  </Card>*/}
        {/*</TabsContent>*/}
      </Tabs>
    </div>
  )
}
