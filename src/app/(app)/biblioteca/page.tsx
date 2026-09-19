'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, X, RefreshCw, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Cifra } from '@/types'

export default function BibliotecaPage() {
  const [cifras, setCifras] = useState<Cifra[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cifra | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
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
      .limit(1000)
    if (data) {
      setCifras(data)
    }
    router.refresh()
    setRefreshing(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    const res = await fetch(`/api/cifras/${deleteTarget.id}`, { method: 'DELETE' })

    if (res.ok) {
      setCifras((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } else {
      const { error } = await res.json()
      alert(`Erro ao excluir: ${error}`)
    }
    setDeleting(false)
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
            <div
              key={cifra.id}
              className="group relative bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-primary-200 transition-all"
            >
              {/* Área clicável para abrir a cifra */}
              <Link
                href={`/cifras/${cifra.id}`}
                className="block p-4 pr-20"
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

              {/* Botões de ação */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/cifras/${cifra.id}/editar`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors"
                  title="Editar cifra"
                  aria-label={`Editar ${cifra.title}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteTarget(cifra)
                  }}
                  className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors"
                  title="Excluir cifra"
                  aria-label={`Excluir ${cifra.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma cifra encontrada para &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Excluir cifra
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Tem certeza que deseja excluir:
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
              {deleteTarget.title}
            </p>
            <p className="text-xs text-gray-500 mb-6">{deleteTarget.artist}</p>
            <p className="text-xs text-red-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
