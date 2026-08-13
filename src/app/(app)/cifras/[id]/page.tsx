import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CifraViewer } from '@/components/cifra/CifraViewer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
      <div className="flex items-center gap-3 mb-4 no-print">
        <Link
          href="/biblioteca"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <CifraViewer
        content={cifra.content}
        originalTom={cifra.tom}
        title={cifra.title}
        artist={cifra.artist}
      />
    </div>
  )
}
