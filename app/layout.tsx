import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import {Analytics} from '@vercel/analytics/next'
import {AuthProvider} from '@/lib/auth-context'
import './globals.css'
import {ThemeProvider} from "next-themes";


const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Mudancana - Sistema de Gestión',
  description: 'Sistema de seguimiento de clientes y servicios de mudanzas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
    <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="mudancana-theme"
    >
      <AuthProvider>{children}</AuthProvider>
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </ThemeProvider>
    </body>
    </html>
  )
}
