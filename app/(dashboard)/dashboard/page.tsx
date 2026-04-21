import { Users, Truck, Bell, Calendar, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats } from '@/lib/db'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats.totalClients,
      icon: Users,
      description: 'Clientes registrados',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Servicios',
      value: stats.totalServices,
      icon: Truck,
      description: 'Mudanzas realizadas',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Recordatorios',
      value: stats.pendingReminders,
      icon: Bell,
      description: 'Pendientes de enviar',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Este Mes',
      value: stats.servicesThisMonth,
      icon: TrendingUp,
      description: 'Servicios completados',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de actividad y métricas principales</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secciones principales */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos servicios */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Próximas Mudanzas
                </CardTitle>
                <CardDescription>Servicios programados para los próximos días</CardDescription>
              </div>
              <Link 
                href="/servicios" 
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.upcomingServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay servicios programados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingServices.slice(0, 5).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">
                          {service.client.name}
                        </p>
                        <Badge variant="secondary" className="shrink-0">
                          {service.status === 'scheduled' ? 'Programado' : service.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {service.origin_city} → {service.destination_city}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(service.service_date), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    {service.price && (
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">
                          ${service.price.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clientes recientes */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Clientes Recientes
                </CardTitle>
                <CardDescription>Últimos clientes agregados al sistema</CardDescription>
              </div>
              <Link 
                href="/clientes" 
                className="text-sm text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay clientes registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-semibold shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{client.phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(client.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
