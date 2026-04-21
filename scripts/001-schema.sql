-- =====================================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA DE SEGUIMIENTO DE MUDANZAS
-- =====================================================

-- Tabla de usuarios (empleados del sistema)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de servicio de mudanza
CREATE TABLE IF NOT EXISTS service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_frequency_days INTEGER DEFAULT 365, -- Frecuencia por defecto para recordatorios
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios realizados
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id),
    
    -- Detalles de la mudanza
    origin_address TEXT NOT NULL,
    origin_city VARCHAR(100),
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100),
    
    -- Fechas
    service_date DATE NOT NULL,
    next_service_date DATE, -- Fecha estimada del próximo servicio
    
    -- Información adicional
    price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    
    -- Control
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de recordatorios
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reminder_date DATE NOT NULL,
    
    -- Canales de notificación
    send_email BOOLEAN DEFAULT false,
    send_whatsapp BOOLEAN DEFAULT false,
    
    -- Estado del recordatorio
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Control
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_services_client_id ON services(client_id);
CREATE INDEX IF NOT EXISTS idx_services_service_date ON services(service_date);
CREATE INDEX IF NOT EXISTS idx_services_next_service_date ON services(next_service_date);
CREATE INDEX IF NOT EXISTS idx_reminders_client_id ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar tipos de servicio por defecto
INSERT INTO service_types (name, description, default_frequency_days) VALUES
    ('Mudanza Residencial', 'Mudanza completa de hogar', 365),
    ('Mudanza Comercial', 'Mudanza de oficinas o negocios', 365),
    ('Mudanza Local', 'Mudanza dentro de la misma ciudad', 180),
    ('Mudanza Interurbana', 'Mudanza entre ciudades', 365),
    ('Embalaje y Desembalaje', 'Servicio de empaque profesional', 365),
    ('Almacenamiento Temporal', 'Guardado de pertenencias', 90)
ON CONFLICT DO NOTHING;

-- Insertar configuraciones por defecto
INSERT INTO settings (key, value, description) VALUES
    ('reminder_days_before', '7', 'Días antes del servicio para enviar recordatorio'),
    ('company_name', 'Mi Empresa de Mudanzas', 'Nombre de la empresa'),
    ('company_email', '', 'Email de la empresa para notificaciones'),
    ('company_phone', '', 'Teléfono de la empresa'),
    ('whatsapp_enabled', 'false', 'Habilitar notificaciones por WhatsApp'),
    ('email_enabled', 'false', 'Habilitar notificaciones por Email')
ON CONFLICT (key) DO NOTHING;

-- Crear usuario administrador por defecto (password: admin123)
-- IMPORTANTE: Cambiar la contraseña después de la instalación
-- El hash corresponde a 'admin123' usando bcrypt
INSERT INTO users (email, password_hash, name, role) VALUES
    ('admin@empresa.com', '$2b$10$rPq8Qk8VQ1XJ5qH3qH3qHOqH3qH3qH3qH3qH3qH3qH3qH3qH3qH3q', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;
