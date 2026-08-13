import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CifraViewer } from '@/components/cifra/CifraViewer'

interface CifraPageProps {
  params: { id: string }
}

export default async function CifraPage({ params }: CifraPageProps) {
  const supabase = createServerSupabaseClient()

  const { data: cifra, error } = await supabase
    .from('cifras')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !cifra) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{cifra.title}</h1>
        <p className="text-gray-600 mt-1">{cifra.artist}</p>
        <div className="flex gap-2 mt-3">
          {cifra.tom && (
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
              Tom: {cifra.tom}
            </span>
          )}
          {cifra.capo && cifra.capo > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">
              Capo: {cifra.capo}ª casa
            </span>
          )}
          {cifra.category && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {cifra.category}
            </span>
          )}
        </div>
      </div>

      <CifraViewer content={cifra.content} originalTom={cifra.tom} />
    </div>
  )
}
