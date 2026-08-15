'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalizedEmail = email.toLowerCase().trim()

    // Verificar se o e-mail está autorizado
    const { data: allowed } = await supabase
      .from('allowed_emails')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (!allowed) {
      setError('Este e-mail não está autorizado. Entre em contato com o administrador.')
      setLoading(false)
      return
    }

    // Enviar Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 text-center">
        <div className="flex justify-center mb-6">
          <img src="/icon-cifra-play.png" alt="Cifra Play" className="w-20 h-20 rounded-2xl" />
        </div>
        <h1 className="text-xl font-bold text-white mb-4">Verifique seu e-mail</h1>
        <p className="text-gray-300 mb-2">
          Enviamos um link de acesso para:
        </p>
        <p className="text-primary-400 font-medium mb-6">{email}</p>
        <p className="text-sm text-gray-400">
          Clique no link no e-mail para entrar no app. Verifique a caixa de spam se não encontrar.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Tentar outro e-mail
        </button>
      </div>
    )
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
        Digite seu e-mail para receber o link de acesso
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
          {loading ? 'Enviando...' : 'Enviar link de acesso'}
        </button>
      </form>
    </div>
  )
}
