'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const DEFAULT_PASSWORD = 'cifra-play-2024-access'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalizedEmail = email.toLowerCase().trim()

    // Chamar API que verifica email, cria/atualiza usuario
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Erro ao acessar.')
      setLoading(false)
      return
    }

    // Agora fazer login com a senha padrão
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: DEFAULT_PASSWORD,
    })

    if (signInError) {
      setError('Erro ao entrar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-center mb-6">
        <img src="/icon-cifra-play.png" alt="Cifra Play" className="w-20 h-20 rounded-2xl" />
      </div>
      <h1 className="text-2xl font-bold text-center text-white mb-2">
        Cifra Play
      </h1>
      <p className="text-center text-gray-400 mb-6 text-sm">
        Digite seu e-mail para acessar
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            placeholder="seu@email.com"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
