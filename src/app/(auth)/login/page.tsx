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

  // Senha padrão interna — segurança é pela lista de emails autorizados
  const DEFAULT_PASSWORD = 'cifra-play-2024-access'

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

    // Tentar fazer login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: DEFAULT_PASSWORD,
    })

    if (signInError) {
      // Se não conseguiu logar, tenta criar a conta (primeiro acesso)
      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: DEFAULT_PASSWORD,
        options: {
          data: { full_name: normalizedEmail.split('@')[0] },
        },
      })

      if (signUpError) {
        setError('Erro ao acessar. Tente novamente.')
        setLoading(false)
        return
      }

      // Logar após criar
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: DEFAULT_PASSWORD,
      })

      if (loginError) {
        setError('Conta criada. Verifique seu e-mail para confirmar o acesso.')
        setLoading(false)
        return
      }
    }

    // Login bem-sucedido
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
