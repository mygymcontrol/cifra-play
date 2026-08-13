import Link from 'next/link'
import { Library, ListMusic, PlusCircle } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()

  const { count } = await supabase
    .from('cifras')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cifra Play</h1>
        <p className="mt-2 text-gray-600">
          Suas cifras organizadas em um só lugar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Link
          href="/repertorio"
          className="flex flex-col items-center gap-3 p-6 bg-primary-50 border-2 border-primary-200 rounded-xl hover:bg-primary-100 transition-colors"
        >
          <ListMusic className="w-8 h-8 text-primary-600" />
          <span className="font-semibold text-primary-700">Repertório do Dia</span>
          <span className="text-xs text-primary-600">Selecione as cifras para usar</span>
        </Link>

        <Link
          href="/biblioteca"
          className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
        >
          <Library className="w-8 h-8 text-gray-600" />
          <span className="font-semibold text-gray-700">Biblioteca</span>
          <span className="text-xs text-gray-500">{count || 0} cifras disponíveis</span>
        </Link>

        <Link
          href="/cifras/nova"
          className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
        >
          <PlusCircle className="w-8 h-8 text-gray-600" />
          <span className="font-semibold text-gray-700">Nova Cifra</span>
          <span className="text-xs text-gray-500">Adicionar manualmente</span>
        </Link>
      </div>
    </div>
  )
}
