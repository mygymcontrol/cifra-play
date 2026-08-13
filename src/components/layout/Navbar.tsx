'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music, Library, User, LogOut, ListMusic, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
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
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Library className="w-4 h-4" aria-hidden="true" />
              <span>Biblioteca</span>
            </Link>
            <Link
              href="/repertorio"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ListMusic className="w-4 h-4" aria-hidden="true" />
              <span>Repertório</span>
            </Link>
            <Link
              href="/perfil"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Perfil"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
