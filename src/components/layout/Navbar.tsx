'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music, Library, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
              <Music className="w-6 h-6" aria-hidden="true" />
              <span>Cifra Play</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/biblioteca"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Library className="w-4 h-4" aria-hidden="true" />
                <span>Biblioteca</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  )
}
