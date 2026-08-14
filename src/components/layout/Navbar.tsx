'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music, Library, User, LogOut, ListMusic, Menu, X, Moon, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const saved = localStorage.getItem('cifra-play-dark')
    if (saved === 'true') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  function toggleDark() {
    const newDark = !dark
    setDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('cifra-play-dark', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('cifra-play-dark', 'false')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-primary-600">
            <Music className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            <span className="hidden sm:inline">Cifra Play</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/biblioteca"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Library className="w-4 h-4" aria-hidden="true" />
              <span>Biblioteca</span>
            </Link>
            <Link
              href="/repertorio"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ListMusic className="w-4 h-4" aria-hidden="true" />
              <span>Repertório</span>
            </Link>
            <button
              onClick={toggleDark}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Alternar modo escuro"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              href="/perfil"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Perfil"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={toggleDark}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Alternar modo escuro"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white pb-3">
          <div className="flex flex-col px-4 pt-2 space-y-2">
            <Link
              href="/biblioteca"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600"
            >
              <Library className="w-4 h-4" />
              <span>Biblioteca</span>
            </Link>
            <Link
              href="/repertorio"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600"
            >
              <ListMusic className="w-4 h-4" />
              <span>Repertório</span>
            </Link>
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-primary-600"
            >
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </Link>
            <button
              onClick={() => { handleLogout(); setOpen(false) }}
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
