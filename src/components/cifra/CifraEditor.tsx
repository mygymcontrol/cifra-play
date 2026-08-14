'use client'

import { useState } from 'react'
import { Minus, Plus, Printer, RotateCcw, Pencil, Eye, Save, Undo2, Palette } from 'lucide-react'
import { transposeContent } from '@/utils/transpose'
import { isChordLine } from '@/utils/chord-detection'
import { isSectionLine } from '@/utils/section-detection'
import { normalizeChordSpacing } from '@/utils/chord-align'
import { NOTES } from '@/types'

const CHORD_COLORS = {
  blue: { name: 'Azul', class: 'text-sky-600', bg: 'bg-sky-100', bgText: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  orange: { name: 'Laranja', class: 'text-orange-700', bg: 'bg-orange-100', bgText: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-600' },
  green: { name: 'Verde', class: 'text-green-700', bg: 'bg-green-100', bgText: 'text-green-800', border: 'border-green-200', dot: 'bg-green-600' },
  red: { name: 'Vermelho', class: 'text-red-700', bg: 'bg-red-100', bgText: 'text-red-800', border: 'border-red-200', dot: 'bg-red-600' },
} as const

type ChordColor = keyof typeof CHORD_COLORS

interface CifraEditorProps {
  content: string
  originalContent: string
  originalTom: string | null
  title?: string
  artist?: string
  onSave: (newContent: string) => void
  onRestore: () => void
  sectionRepeats?: Record<number, number>
  onSectionRepeatsChange?: (repeats: Record<number, number>) => void
}

export function CifraEditor({ content, originalContent, originalTom, title, artist, onSave, onRestore, sectionRepeats: savedRepeats, onSectionRepeatsChange }: CifraEditorProps) {
  const [transpose, setTranspose] = useState(0)
  const [fontSize, setFontSize] = useState(8)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [chordColor, setChordColor] = useState<ChordColor>('blue')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [sectionRepeats, setSectionRepeats] = useState<Record<number, number>>(savedRepeats || {})
  const [activeRepeatLine, setActiveRepeatLine] = useState<number | null>(null)
  const [lastFocusedLine, setLastFocusedLine] = useState<number | null>(null)

  const rawContent = editing ? editContent : content
  const displayContent = normalizeChordSpacing(transposeContent(rawContent, transpose))
  const currentTom = originalTom
    ? NOTES[(NOTES.indexOf(originalTom as any) + transpose + 12) % 12]
    : null

  const color = CHORD_COLORS[chordColor]
  const isEdited = content !== originalContent

  function handleSave() {
    onSave(editContent)
    setEditing(false)
  }

  function handleCancel() {
    setEditContent(content)
    setEditing(false)
  }

  function handleRestore() {
    if (confirm('Restaurar a cifra para o formato original? As edições serão perdidas.')) {
      onRestore()
      setEditContent(originalContent)
      setEditing(false)
      setSectionRepeats({})
      onSectionRepeatsChange?.({})
    }
  }

  function setRepeat(lineIndex: number, value: number | null) {
    const next = { ...sectionRepeats }
    if (value) {
      next[lineIndex] = value
    } else {
      delete next[lineIndex]
    }
    setSectionRepeats(next)
    setActiveRepeatLine(null)
    // Auto-save to repertório
    onSectionRepeatsChange?.(next)
  }

  function insertSection(sectionName: string) {
    // Use the last focused line, or end of document
    const lineIndex = lastFocusedLine !== null ? lastFocusedLine : editContent.split('\n').length - 1

    const lines = editContent.split('\n')
    lines.splice(lineIndex + 1, 0, '', `[${sectionName}]`)
    setEditContent(lines.join('\n'))

    const newLineIndex = lineIndex + 2
    setLastFocusedLine(newLineIndex)

    // Focus and scroll to the new line
    setTimeout(() => {
      const next = document.querySelector(`[data-line="${newLineIndex}"]`) as HTMLInputElement
      if (next) {
        next.focus()
        next.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }

  // Move a section (from its header to the next section) up or down
  function moveSectionUp(sectionLineIndex: number) {
    const lines = editContent.split('\n')
    const sectionRegex = /^\s*(?:\d+x\s*)?\[?(?:INTRO|INTRODUÇÃO|VERSO|PRÉ-REFRÃO|PRE-REFRÃO|REFRÃO|PONTE|BRIDGE|SOLO|INTERLÚDIO|INTERLUDIO|INSTRUMENTAL|FINAL|CODA|OUTR[OA]|CORO|RAMPA)\]?/i

    // Find end of this section (next section start or end of file)
    let sectionEnd = lines.length
    for (let j = sectionLineIndex + 1; j < lines.length; j++) {
      if (/^\s*\[([^\]]+)\]/.test(lines[j]) || sectionRegex.test(lines[j].trim())) {
        sectionEnd = j
        break
      }
    }

    // Find start of previous section
    let prevSectionStart = -1
    for (let j = sectionLineIndex - 1; j >= 0; j--) {
      if (/^\s*\[([^\]]+)\]/.test(lines[j]) || sectionRegex.test(lines[j].trim())) {
        prevSectionStart = j
        break
      }
    }

    if (prevSectionStart === -1) return // Already at top

    // Extract this section's lines
    const sectionLines = lines.splice(sectionLineIndex, sectionEnd - sectionLineIndex)
    // Insert before previous section
    lines.splice(prevSectionStart, 0, ...sectionLines)
    setEditContent(lines.join('\n'))
  }

  function moveSectionDown(sectionLineIndex: number) {
    const lines = editContent.split('\n')
    const sectionRegex = /^\s*(?:\d+x\s*)?\[?(?:INTRO|INTRODUÇÃO|VERSO|PRÉ-REFRÃO|PRE-REFRÃO|REFRÃO|PONTE|BRIDGE|SOLO|INTERLÚDIO|INTERLUDIO|INSTRUMENTAL|FINAL|CODA|OUTR[OA]|CORO|RAMPA)\]?/i

    // Find end of this section
    let sectionEnd = lines.length
    for (let j = sectionLineIndex + 1; j < lines.length; j++) {
      if (/^\s*\[([^\]]+)\]/.test(lines[j]) || sectionRegex.test(lines[j].trim())) {
        sectionEnd = j
        break
      }
    }

    // Find end of NEXT section
    if (sectionEnd >= lines.length) return // Already at bottom

    let nextSectionEnd = lines.length
    for (let j = sectionEnd + 1; j < lines.length; j++) {
      if (/^\s*\[([^\]]+)\]/.test(lines[j]) || sectionRegex.test(lines[j].trim())) {
        nextSectionEnd = j
        break
      }
    }

    // Extract next section and insert before this one
    const nextSectionLines = lines.splice(sectionEnd, nextSectionEnd - sectionEnd)
    lines.splice(sectionLineIndex, 0, ...nextSectionLines)
    setEditContent(lines.join('\n'))
  }

  function deleteSection(sectionLineIndex: number) {
    const lines = editContent.split('\n')
    const sectionRegex = /^\s*(?:\d+x\s*)?\[?(?:INTRO|INTRODUÇÃO|VERSO|PRÉ-REFRÃO|PRE-REFRÃO|REFRÃO|PONTE|BRIDGE|SOLO|INTERLÚDIO|INTERLUDIO|INSTRUMENTAL|FINAL|CODA|OUTR[OA]|CORO|RAMPA)\]?/i

    // Find end of this section (next section start or end of file)
    let sectionEnd = lines.length
    for (let j = sectionLineIndex + 1; j < lines.length; j++) {
      if (/^\s*\[([^\]]+)\]/.test(lines[j]) || sectionRegex.test(lines[j].trim())) {
        sectionEnd = j
        break
      }
    }

    // Remove the section lines
    lines.splice(sectionLineIndex, sectionEnd - sectionLineIndex)
    setEditContent(lines.join('\n'))
  }

  function handlePrint() {
    window.print()
  }

  // Render content with section highlighting
  function renderContent(text: string) {
    const lines = text.split('\n')
    
    // PASSO 1: Determinar quais linhas pertencem ao refrão
    const isRefraoArr: boolean[] = new Array(lines.length).fill(false)
    let refrao = false
    
    for (let i = 0; i < lines.length; i++) {
      const isEmpty = !lines[i] || /^\s*$/.test(lines[i])
      if (isEmpty) { refrao = false; continue }
      const sm = lines[i].trim().match(/^\[([^\]]+)\]/)
      if (sm) { refrao = /refrão|refrao|coro/i.test(sm[1]) }
      else if (isSectionLine(lines[i])) { refrao = /refrão|refrao|coro/i.test(lines[i]) }
      isRefraoArr[i] = refrao
    }
    
    // PASSO 2: Agrupar e renderizar
    const groups: { isRefrao: boolean; elements: React.ReactNode[] }[] = []
    let currentGroup: { isRefrao: boolean; elements: React.ReactNode[] } | null = null
    let prevWasEmpty = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      const lineIsRefrao = isRefraoArr[i]
      
      if (trimmed.length === 0) {
        if (prevWasEmpty) continue
        prevWasEmpty = true
      } else {
        prevWasEmpty = false
      }
      
      let element: React.ReactNode
      const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*(.*)$/)
      
      if (sectionMatch) {
        const repeat = sectionRepeats[i]
        element = (
          <div key={i} className="section-header mt-2 mb-0.5 relative inline-block">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 ${color.bg} ${color.bgText} text-xs font-bold rounded uppercase tracking-wide cursor-pointer hover:opacity-80`}
              onClick={() => setActiveRepeatLine(activeRepeatLine === i ? null : i)}
            >
              {repeat && <span>{repeat}x</span>}
              {sectionMatch[1]}
            </span>
            {sectionMatch[2] && <span className={`ml-1 ${color.class} font-bold`}>{sectionMatch[2]}</span>}
            {activeRepeatLine === i && (
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg p-1.5 z-20 flex gap-1 flex-wrap no-print">
                <button onClick={() => setRepeat(i, null)} className={`w-7 h-7 text-[10px] rounded flex items-center justify-center ${!repeat ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}>—</button>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setRepeat(i, n)} className={`w-7 h-7 text-[10px] rounded flex items-center justify-center ${repeat === n ? `${color.bg} ${color.bgText} font-bold` : 'hover:bg-gray-100'}`}>{n}x</button>
                ))}
              </div>
            )}
          </div>
        )
      } else if (isSectionLine(line)) {
        const repeat = sectionRepeats[i]
        const sectionNameMatch = line.trim().match(/^(\d+x\s*)?(\[?(?:INTRO|INTRODUÇÃO|VERSO|PRÉ-REFRÃO|PRE-REFRÃO|REFRÃO|PONTE|BRIDGE|SOLO|INTERLÚDIO|INTERLUDIO|INSTRUMENTAL|FINAL|CODA|OUTR[OA]|CORO|RAMPA|PRIMEIRA PARTE|SEGUNDA PARTE|TERCEIRA PARTE)\]?)\s*(.*)$/i)
        const sectionLabel = sectionNameMatch ? (sectionNameMatch[1] || '') + sectionNameMatch[2].replace(/[\[\]]/g, '') : line.trim()
        const sectionRest = sectionNameMatch ? sectionNameMatch[3] : ''
        element = (
          <div key={i} className="section-header mt-2 mb-0.5 relative inline-block">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 ${color.bg} ${color.bgText} text-xs font-bold rounded uppercase tracking-wide cursor-pointer hover:opacity-80`}
              onClick={() => setActiveRepeatLine(activeRepeatLine === i ? null : i)}
            >
              {repeat && <span>{repeat}x</span>}
              {sectionLabel}
            </span>
            {sectionRest && <span className={`ml-1 ${color.class} font-bold`}>{sectionRest}</span>}
            {activeRepeatLine === i && (
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg p-1.5 z-20 flex gap-1 flex-wrap no-print">
                <button onClick={() => setRepeat(i, null)} className={`w-7 h-7 text-[10px] rounded flex items-center justify-center ${!repeat ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}>—</button>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setRepeat(i, n)} className={`w-7 h-7 text-[10px] rounded flex items-center justify-center ${repeat === n ? `${color.bg} ${color.bgText} font-bold` : 'hover:bg-gray-100'}`}>{n}x</button>
                ))}
              </div>
            )}
          </div>
        )
      } else if (trimmed.length > 0 && isChordLine(line)) {
        element = (
          <div key={i} className={`chord-line ${color.class} font-bold whitespace-pre`}>
            {line}
          </div>
        )
      } else if (trimmed.length === 0) {
        element = <div key={i} className="whitespace-pre">{'\u00A0'}</div>
      } else {
        element = (
          <div key={i} className={`whitespace-pre text-gray-900 dark:text-gray-100 ${lineIsRefrao ? 'font-bold' : ''}`}>
            {line}
          </div>
        )
      }
      
      if (!currentGroup || currentGroup.isRefrao !== lineIsRefrao) {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = { isRefrao: lineIsRefrao, elements: [element] }
      } else {
        currentGroup.elements.push(element)
      }
    }
    
    if (currentGroup) groups.push(currentGroup)
    
    return groups.map((group, gi) => (
      <div key={gi} className={group.isRefrao ? 'refrao-bg' : ''}>
        {group.elements}
      </div>
    ))
  }

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg no-print">
        {/* Tom */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tom:</span>
          {currentTom && (
            <span className={`text-sm font-bold ${color.class}`}>{currentTom}</span>
          )}
          <button
            onClick={() => setTranspose((t) => t - 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50"
            aria-label="Diminuir tom"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setTranspose((t) => t + 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50"
            aria-label="Aumentar tom"
          >
            <Plus className="w-3 h-3" />
          </button>
          {transpose !== 0 && (
            <button
              onClick={() => setTranspose(0)}
              className="text-xs text-gray-500 hover:underline"
              aria-label="Resetar tom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 hidden sm:block" />

        {/* Fonte */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fonte:</span>
          <button
            onClick={() => setFontSize((s) => Math.max(7, s - 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50"
            aria-label="Diminuir fonte"
          >
            <span className="text-xs font-bold">A-</span>
          </button>
          <span className="text-xs font-medium w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50"
            aria-label="Aumentar fonte"
          >
            <span className="text-xs font-bold">A+</span>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 hidden sm:block" />

        {/* Cor da cifra */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-50 transition-colors"
            aria-label="Cor da cifra"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className={`w-3 h-3 rounded-full ${color.dot}`} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full mt-1 left-0 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg p-2 z-10 flex gap-2">
              {(Object.keys(CHORD_COLORS) as ChordColor[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setChordColor(key); setShowColorPicker(false) }}
                  className={`w-7 h-7 rounded-full ${CHORD_COLORS[key].dot} ${chordColor === key ? 'ring-2 ring-offset-2 ring-gray-400' : ''} hover:scale-110 transition-transform`}
                  aria-label={CHORD_COLORS[key].name}
                  title={CHORD_COLORS[key].name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 hidden sm:block" />

        {/* Editar / Visualizar */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>
          </div>
        )}

        {/* Restaurar */}
        {isEdited && !editing && (
          <>
            <div className="w-px h-6 bg-gray-300 hidden sm:block" />
            <button
              onClick={handleRestore}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Restaurar</span>
            </button>
          </>
        )}

        <div className="w-px h-6 bg-gray-300 hidden sm:block" />

        {/* Imprimir */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      {/* Seções rápidas (só no modo edição) */}
      {editing && (
        <div className="flex flex-wrap gap-2 mb-3 no-print">
          <span className="text-xs text-gray-500 self-center">
            Inserir seção {lastFocusedLine !== null ? `(após linha ${lastFocusedLine + 1})` : '(clique numa linha primeiro)'}:
          </span>
          {['Intro', 'Verso', 'Pré-Refrão', 'Refrão', 'Ponte', 'Solo', 'Final'].map((section) => (
            <button
              key={section}
              onClick={() => insertSection(section)}
              className={`px-2 py-1 text-xs ${color.bg} ${color.bgText} rounded hover:opacity-80 transition-colors border ${color.border}`}
            >
              [{section}]
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      <div className="cifra-sheet bg-white dark:bg-black sm:rounded-lg sm:border border-gray-200 dark:border-gray-800">
        {(title || artist) && (
          <div className="cifra-header mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            {title && <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              {artist && <span>{artist}</span>}
              {currentTom && <span>Tom: {currentTom}</span>}
            </div>
          </div>
        )}

        {editing ? (
          <div className="cifra-editor-visual">
            {editContent.split('\n').map((line, i, arr) => {
              const isSectionHeader = /^\s*\[([^\]]+)\]/.test(line)
              const isSectionKeyword = /^\s*(?:\d+x\s*)?\[?(?:INTRO|VERSO|PRÉ-REFRÃO|PRE-REFRÃO|REFRÃO|PONTE|BRIDGE|SOLO|INTERLÚDIO|INTERLUDIO|INSTRUMENTAL|FINAL|CODA|OUTR[OA]|CORO|RAMPA)\]?/i.test(line.trim())
              const isSection = isSectionHeader || isSectionKeyword
              const showDivider = isSection && i > 0

              return (
                <div key={i}>
                  {showDivider && (
                    <div className={`border-t-2 border-dashed ${color.border} my-2`} />
                  )}
                  <div className="flex group">
                    <span className="select-none text-[10px] text-gray-300 w-6 text-right pr-2 pt-0.5 shrink-0 group-hover:text-gray-400">
                      {i + 1}
                    </span>
                    {isSection && (
                      <div className="flex flex-col justify-center mr-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveSectionUp(i)}
                          className="text-base sm:text-sm text-gray-400 hover:text-primary-600 leading-none p-1"
                          aria-label="Mover seção para cima"
                          title="Mover seção ▲"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveSectionDown(i)}
                          className="text-base sm:text-sm text-gray-400 hover:text-primary-600 leading-none p-1"
                          aria-label="Mover seção para baixo"
                          title="Mover seção ▼"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => deleteSection(i)}
                          className="text-base sm:text-sm text-gray-400 hover:text-red-600 leading-none p-1 mt-0.5"
                          aria-label="Excluir seção"
                          title="Excluir seção"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => {
                        const lines = editContent.split('\n')
                        lines[i] = e.target.value
                        setEditContent(lines.join('\n'))
                      }}
                      onFocus={() => setLastFocusedLine(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const lines = editContent.split('\n')
                          lines.splice(i + 1, 0, '')
                          setEditContent(lines.join('\n'))
                          setTimeout(() => {
                            const next = document.querySelector(`[data-line="${i + 1}"]`) as HTMLInputElement
                            next?.focus()
                          }, 0)
                        }
                        if (e.key === 'Backspace' && line === '' && arr.length > 1) {
                          e.preventDefault()
                          const lines = editContent.split('\n')
                          lines.splice(i, 1)
                          setEditContent(lines.join('\n'))
                          setTimeout(() => {
                            const prev = document.querySelector(`[data-line="${Math.max(0, i - 1)}"]`) as HTMLInputElement
                            prev?.focus()
                          }, 0)
                        }
                      }}
                      data-line={i}
                      spellCheck={false}
                      className={`w-full border-0 focus:ring-0 py-0.5 px-1 font-mono bg-transparent focus:bg-blue-50 rounded ${
                        isSection
                          ? `font-bold ${color.class}`
                          : 'text-gray-800'
                      }`}
                      style={{ fontSize: `${fontSize}px`, lineHeight: '1.3' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="cifra-content font-mono"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.3' }}
          >
            {renderContent(displayContent)}
          </div>
        )}
      </div>
    </div>
  )
}
