'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, X, Printer, Music, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { CifraEditor } from '@/components/cifra/CifraEditor'
import type { Cifra } from '@/types'

interface SelectedCifra {
  cifra: Cifra
  customTom: string | null
  customContent: string | null
  sectionRepeats: Record<number, number>
}

const LOCAL_KEY = 'cifra-play-repertorio'

export default function RepertorioPage() {
  const [allCifras, setAllCifras] = useState<Cifra[]>([])
  const [selected, setSelected] = useState<SelectedCifra[]>([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Swipe handling
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const swipeRef = useRef<HTMLDivElement>(null)

  const viewingCifra = viewingIndex !== null ? selected[viewingIndex] : null

  const supabase = createClient()

  useEffect(() => {
    init()
  }, [])

  async function init() {
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    // Load cifras
    const { data: cifras } = await supabase
      .from('cifras')
      .select('*')
      .order('title', { ascending: true })
    setAllCifras(cifras || [])

    // Load repertorio: try remote first, fallback to local
    if (user) {
      const loaded = await loadFromRemote(user.id)
      if (!loaded) {
        loadFromLocal()
      }
    } else {
      loadFromLocal()
    }
    setLoading(false)
  }

  async function loadFromRemote(uid: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('repertorio_items')
        .select('*, cifra:cifras(*)')
        .eq('user_id', uid)
        .order('order', { ascending: true })

      if (error || !data || data.length === 0) return false

      const items: SelectedCifra[] = data
        .filter((item: any) => item.cifra)
        .map((item: any) => ({
          cifra: item.cifra as Cifra,
          customTom: item.custom_tom,
          customContent: item.custom_content,
          sectionRepeats: (item.section_repeats as Record<number, number>) || {},
        }))

      setSelected(items)
      // Update local cache
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
      return true
    } catch {
      return false
    }
  }

  function loadFromLocal() {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (saved) {
      try {
        setSelected(JSON.parse(saved))
      } catch {}
    }
  }

  // Save to localStorage and sync to remote
  const saveRepertorio = useCallback(async (items: SelectedCifra[]) => {
    setSelected(items)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
    await syncToRemote(items)
  }, [userId])

  async function syncToRemote(items: SelectedCifra[]) {
    if (!userId) return
    setSyncing(true)
    try {
      // Delete all current items for user
      await supabase
        .from('repertorio_items')
        .delete()
        .eq('user_id', userId)

      // Insert new items
      if (items.length > 0) {
        const rows = items.map((item, index) => ({
          user_id: userId,
          cifra_id: item.cifra.id,
          order: index,
          custom_tom: item.customTom,
          custom_content: item.customContent,
          section_repeats: item.sectionRepeats || {},
        }))
        await supabase.from('repertorio_items').insert(rows)
      }
    } catch {
      // Offline — local is already saved, will sync next time
    }
    setSyncing(false)
  }

  function addCifra(cifra: Cifra) {
    if (selected.some((s) => s.cifra.id === cifra.id)) return
    const newSelected = [...selected, { cifra, customTom: cifra.tom, customContent: null, sectionRepeats: {} }]
    saveRepertorio(newSelected)
    setShowSearch(false)
    setSearch('')
  }

  function removeCifra(id: string) {
    const newSelected = selected.filter((s) => s.cifra.id !== id)
    saveRepertorio(newSelected)
  }

  function updateTom(id: string, tom: string) {
    const newSelected = selected.map((s) =>
      s.cifra.id === id ? { ...s, customTom: tom } : s
    )
    saveRepertorio(newSelected)
  }

  function updateContent(id: string, newContent: string) {
    const newSelected = selected.map((s) =>
      s.cifra.id === id ? { ...s, customContent: newContent } : s
    )
    saveRepertorio(newSelected)
  }

  function updateSectionRepeats(id: string, repeats: Record<number, number>) {
    const newSelected = selected.map((s) =>
      s.cifra.id === id ? { ...s, sectionRepeats: repeats } : s
    )
    saveRepertorio(newSelected)
  }

  function moveUp(index: number) {
    if (index === 0) return
    const newSelected = [...selected]
    ;[newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]]
    saveRepertorio(newSelected)
  }

  function moveDown(index: number) {
    if (index === selected.length - 1) return
    const newSelected = [...selected]
    ;[newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]]
    saveRepertorio(newSelected)
  }

  function clearAll() {
    if (confirm('Limpar todo o repertório?')) {
      saveRepertorio([])
    }
  }

  async function forceSync() {
    if (!userId) return
    setSyncing(true)
    await loadFromRemote(userId)
    setSyncing(false)
  }

  function handlePrintAll() {
    window.print()
  }

  // Navigation between cifras
  function goToNext() {
    if (viewingIndex !== null && viewingIndex < selected.length - 1) {
      setViewingIndex(viewingIndex + 1)
      window.scrollTo(0, 0)
    }
  }

  function goToPrev() {
    if (viewingIndex !== null && viewingIndex > 0) {
      setViewingIndex(viewingIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Only trigger swipe if horizontal movement > 80px and more horizontal than vertical
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        goToNext() // swipe left = next
      } else {
        goToPrev() // swipe right = previous
      }
    }
  }

  const filteredCifras = allCifras.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.title.toLowerCase().includes(q) ||
      c.artist.toLowerCase().includes(q)
    )
  })

  // Se está visualizando uma cifra individual
  if (viewingCifra && viewingIndex !== null) {
    return (
      <div
        className="max-w-4xl mx-auto"
        ref={swipeRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header de navegação */}
        <div className="flex items-center justify-between mb-4 no-print">
          <button
            onClick={() => setViewingIndex(null)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Voltar ao repertório
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              disabled={viewingIndex === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Música anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {viewingIndex + 1} / {selected.length}
            </span>
            <button
              onClick={goToNext}
              disabled={viewingIndex === selected.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Próxima música"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <CifraEditor
          content={viewingCifra.customContent || viewingCifra.cifra.content}
          originalContent={viewingCifra.cifra.content}
          originalTom={viewingCifra.customTom || viewingCifra.cifra.tom}
          title={viewingCifra.cifra.title}
          artist={viewingCifra.cifra.artist}
          sectionRepeats={viewingCifra.sectionRepeats}
          onSave={(newContent) => {
            updateContent(viewingCifra.cifra.id, newContent)
          }}
          onRestore={() => {
            updateContent(viewingCifra.cifra.id, viewingCifra.cifra.content)
            updateSectionRepeats(viewingCifra.cifra.id, {})
          }}
          onSectionRepeatsChange={(repeats) => {
            updateSectionRepeats(viewingCifra.cifra.id, repeats)
          }}
        />
        <p className="text-xs text-gray-400 mt-3 no-print text-center">
          ← Arraste para os lados para navegar entre as músicas →
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Repertório do Dia</h1>
          {syncing && <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />}
        </div>
        <div className="flex gap-2">
          <button
            onClick={forceSync}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            title="Sincronizar com outros dispositivos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {selected.length > 0 && (
            <>
              <button
                onClick={handlePrintAll}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lista de cifras selecionadas */}
      {selected.length > 0 ? (
        <div className="space-y-2 mb-6">
          {selected.map((item, index) => (
            <div
              key={item.cifra.id}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(index)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Mover para cima"
                  disabled={index === 0}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(index)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Mover para baixo"
                  disabled={index === selected.length - 1}
                >
                  ▼
                </button>
              </div>

              <span className="text-xs font-bold text-gray-400 w-5">{index + 1}</span>

              <div
                className="flex-1 cursor-pointer"
                onClick={() => setViewingIndex(index)}
              >
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {item.cifra.title}
                  {item.customContent && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                      editada
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">{item.cifra.artist}</p>
              </div>

              <select
                value={item.customTom || ''}
                onChange={(e) => updateTom(item.cifra.id, e.target.value)}
                className="text-xs px-2 py-1 border border-gray-200 rounded"
                aria-label="Tom"
              >
                <option value="">Tom</option>
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <button
                onClick={() => removeCifra(item.cifra.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Music className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma cifra selecionada</p>
          <p className="text-sm text-gray-400 mt-1">Adicione cifras ao repertório do dia</p>
        </div>
      )}

      {/* Botão para adicionar */}
      {!showSearch ? (
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors no-print"
        >
          <Plus className="w-4 h-4" />
          Adicionar cifra ao repertório
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg p-4 no-print">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Adicionar cifra</h3>
            <button
              onClick={() => { setShowSearch(false); setSearch('') }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cifra..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredCifras.slice(0, 50).map((cifra) => {
              const isAdded = selected.some((s) => s.cifra.id === cifra.id)
              return (
                <button
                  key={cifra.id}
                  onClick={() => !isAdded && addCifra(cifra)}
                  disabled={isAdded}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    isAdded
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <span className="font-medium">{cifra.title}</span>
                  <span className="text-xs text-gray-500 ml-2">{cifra.artist}</span>
                  {cifra.tom && (
                    <span className="text-xs text-primary-600 ml-2">{cifra.tom}</span>
                  )}
                  {isAdded && <span className="text-xs ml-2">(adicionada)</span>}
                </button>
              )
            })}
            {filteredCifras.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma cifra encontrada</p>
            )}
          </div>
        </div>
      )}

      {/* Print view - mostra todas as cifras formatadas */}
      <div className="hidden print:block">
        {selected.map((item, index) => (
          <div key={item.cifra.id} className="cifra-sheet page-break-after">
            <div className="cifra-header mb-3 pb-2 border-b border-gray-200">
              <h2 className="text-lg font-bold">{item.cifra.title}</h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{item.cifra.artist}</span>
                {item.customTom && <span>Tom: {item.customTom}</span>}
              </div>
            </div>
            <pre className="cifra-content text-sm whitespace-pre-wrap">{item.cifra.content}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
