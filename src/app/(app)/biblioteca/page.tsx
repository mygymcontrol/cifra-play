import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function BibliotecaPage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: cifras } = await supabase
    .from('cifras')
    .select('*')
    .eq('user_id', user!.id)
    .order('title', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minha Biblioteca</h1>
        <Link
          href="/cifras/nova"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Nova Cifra
        </Link>
      </div>

      {cifras && cifras.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cifras.map((cifra) => (
            <Link
              key={cifra.id}
              href={`/cifras/${cifra.id}`}
              className="block p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 truncate">
                {cifra.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{cifra.artist}</p>
              <div className="flex gap-2 mt-3">
                {cifra.tom && (
                  <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                    {cifra.tom}
                  </span>
                )}
                {cifra.category && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {cifra.category}
                  </span>
                )}
                {!cifra.is_public && (
                  <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                    Privada
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Sua biblioteca está vazia.</p>
          <Link href="/cifras/nova" className="text-primary-600 hover:underline mt-2 inline-block">
            Adicione sua primeira cifra
          </Link>
        </div>
      )}
    </div>
  )
}
