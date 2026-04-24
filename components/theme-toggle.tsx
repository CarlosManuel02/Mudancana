'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() =>
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 mr-2" />
          Tema Claro
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 mr-2" />
          Tema Oscuro
        </>
      )}
    </Button>
  )
}