import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      cookies: {
        getAll() {
          // Lê todos os cookies do documento
          if (typeof document === 'undefined') return []
          return document.cookie.split(';').map((c) => {
            const [name, ...rest] = c.trim().split('=')
            return { name, value: decodeURIComponent(rest.join('=')) }
          })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value }) => {
            // Força maxAge de 1 ano em todos os cookies de sessão
            const encoded = encodeURIComponent(value)
            document.cookie = `${name}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${
              location.protocol === 'https:' ? '; secure' : ''
            }`
          })
        },
      },
    }
  )
}
