'use client'

import { useState, useRef } from 'react'
import { transposeContent } from '@/utils/transpose'
import { isChordLine } from '@/utils/chord-detection'
import { isSectionLine } from '@/utils/section-detection'
import { NOTES } from '@/types'
import { Minus, Plus, Printer, RotateCcw } from 'lucide-react'

interface CifraViewerProps {
  content: string
  originalTom: string | null
  title?: string
  artist?: string
}

export function CifraViewer({ content, originalTom, title, artist }: CifraViewerProps) {
  const [transpose, setTranspose] = useState(0)
  const [fontSize, setFontSize] = useState(14)
  const printRef = useRef<HTMLDivElement>(null)

  const displayContent = transposeContent(content, transpose)
  const currentTom = originalTom
    ? NOTES[(NOTES.indexOf(originalTom as any) + transpose + 12) % 12]
    : null

  function handlePrint() {
    window.print()
  }

  // Render content with section highlighting
  function renderContent(text: string) {
    const lines = text.split('\n')
    
    // PASSO 1: Determinar quais linhas pertencem ao refrão
    const isRefraoLine: boolean[] = new Array(lines.length).fill(false)
    let inRefrao = false
    
    for (let i = 0; i < lines.length; i++) {
      const isEmpty = !lines[i] || lines[i].match(/^\s*$/)
      
      // Linha vazia/whitespace = encerra refrão
      if (isEmpty) {
        inRefrao = false
        continue
      }
      
      // Marcador de seção
      const sectionMatch = lines[i].trim().match(/^\[([^\]]+)\]/)
      if (sectionMatch) {
        inRefrao = /refrão|refrao|coro/i.test(sectionMatch[1])
      } else if (isSectionLine(lines[i])) {
        inRefrao = /refrão|refrao|coro/i.test(lines[i])
      }
      
      isRefraoLine[i] = inRefrao
    }
    
    // PASSO 2: Agrupar linhas consecutivas com mesmo estado de refrão
    const groups: { isRefrao: boolean; elements: React.ReactNode[] }[] = []
    let currentGroup: { isRefrao: boolean; elements: React.ReactNode[] } | null = null
    let prevWasEmpty = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      const lineIsRefrao = isRefraoLine[i]
      
      // Colapsar linhas vazias consecutivas
      if (trimmed.length === 0) {
        if (prevWasEmpty) continue
        prevWasEmpty = true
      } else {
        prevWasEmpty = false
      }
      
      // Criar elemento
      let element: React.ReactNode
      const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*(.*)$/)
      
      if (sectionMatch) {
        element = (
          <div key={i} className="section-header mt-2 mb-0.5">
            <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded uppercase tracking-wide">
              {sectionMatch[1]}
            </span>
            {sectionMatch[2] && <span className="ml-2 text-primary-600 font-bold">{sectionMatch[2]}</span>}
          </div>
        )
      } else if (isSectionLine(line)) {
        element = (
          <div key={i} className="section-header mt-2 mb-0.5 text-primary-600 font-bold whitespace-pre">
            {line}
          </div>
        )
      } else if (trimmed.length > 0 && isChordLine(line)) {
        element = (
          <div key={i} className="chord-line text-primary-600 font-bold whitespace-pre">
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
      
      // Agrupar
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
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg no-print">
        {/* Tom */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tom:</span>
          {currentTom && (
            <span className="text-sm font-bold text-primary-600">{currentTom}</span>
          )}
          <button
            onClick={() => setTranspose((t) => t - 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 hover:bg-gray-50"
            aria-label="Diminuir tom"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setTranspose((t) => t + 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 hover:bg-gray-50"
            aria-label="Aumentar tom"
          >
            <Plus className="w-3 h-3" />
          </button>
          {transpose !== 0 && (
            <button
              onClick={() => setTranspose(0)}
              className="text-xs text-primary-600 hover:underline"
              aria-label="Resetar tom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 hidden sm:block" />

        {/* Fonte */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fonte:</span>
          <button
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 hover:bg-gray-50"
            aria-label="Diminuir fonte"
          >
            <span className="text-xs font-bold">A-</span>
          </button>
          <span className="text-xs font-medium w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 hover:bg-gray-50"
            aria-label="Aumentar fonte"
          >
            <span className="text-xs font-bold">A+</span>
          </button>
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 hidden sm:block" />

        {/* Imprimir */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      {/* Conteúdo da cifra (A4 printable) */}
      <div
        ref={printRef}
        className="cifra-sheet bg-white dark:bg-gray-800 sm:rounded-lg sm:border border-gray-200 dark:border-gray-700"
      >
        {/* Header da cifra (aparece na impressão) */}
        {(title || artist) && (
          <div className="cifra-header mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            {title && <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              {artist && <span>{artist}</span>}
              {currentTom && <span>Tom: {currentTom}</span>}
            </div>
          </div>
        )}

        {/* Corpo */}
        <div
          className="cifra-content font-mono leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.3' }}
        >
          {renderContent(displayContent)}
        </div>
      </div>
    </div>
  )
}
