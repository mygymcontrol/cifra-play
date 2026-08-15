'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, X, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Cifra } from '@/types'

export default function BibliotecaPage() {
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCifras()
  }, [])

  async function loadCifras() {
    const { data } = await supabase
      .from('cifras')
      .select('*')
      .order('title', { ascending: true })

    setCifras(data || [])
    setLoading(false)
  }

  async function handleRefresh() {
    setRefreshing(true)
    const { data } = await supabase
      .from('cifras')
      .select('*')
      .order('title', { ascending: true })
    setCifras(data || [])
    setRefreshing(false)
  }

  const filtered = cifras.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.title.toLowerCase().includes(q) ||
      c.artist.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q))
    )
  })

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>
  }

  return (
    <div>
      {refreshing && (
        <div className="flex justify-center py-3">
          <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Biblioteca</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/cifras/nova"
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          Nova Cifra
        </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por título, artista ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} cifra{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cifra) => (
            <Link
              key={cifra.id}
              href={`/cifras/${cifra.id}`}
              className="block p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-primary-200 transition-all"
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                {cifra.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{cifra.artist}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {cifra.tom && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-700 rounded">
                    {cifra.tom}
                  </span>
                )}
                {cifra.category && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                    {cifra.category}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma cifra encontrada para &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
