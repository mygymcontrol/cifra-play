import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()

  const { data: cifras } = await supabase
    .from('cifras')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cifra Play</h1>
        <p className="mt-2 text-gray-600">
          Suas cifras organizadas em um só lugar
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <Link
          href="/cifras/nova"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Nova Cifra
        </Link>
        <Link
          href="/biblioteca"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Minha Biblioteca
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cifras?.map((cifra) => (
          <Link
            key={cifra.id}
            href={`/cifras/${cifra.id}`}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 truncate">
              {cifra.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{cifra.artist}</p>
            {cifra.tom && (
              <span className="mt-3 inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                Tom: {cifra.tom}
              </span>
            )}
          </Link>
        ))}

        {(!cifras || cifras.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>Nenhuma cifra encontrada.</p>
            <Link href="/cifras/nova" className="text-primary-600 hover:underline mt-2 inline-block">
              Adicione sua primeira cifra
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
