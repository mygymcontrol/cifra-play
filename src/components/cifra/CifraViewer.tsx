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
    let inRefrao = false

    return lines.map((line, i) => {
      // Detect section headers like [Verso], [Refrão], [INTRO], etc.
      const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*(.*)$/)
      if (sectionMatch) {
        inRefrao = /refrão|refrao|coro/i.test(sectionMatch[1])
        return (
          <div key={i} className="section-header mt-2 mb-0.5">
            <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded uppercase tracking-wide">
              {sectionMatch[1]}
            </span>
            {sectionMatch[2] && <span className="ml-2 text-primary-600 font-bold">{sectionMatch[2]}</span>}
          </div>
        )
      }

      // Detect section keywords WITHOUT brackets (INSTRUMENTAL 2x, 4x[PONTE], INTERLÚDIO, etc.)
      if (isSectionLine(line)) {
        inRefrao = /refrão|refrao|coro/i.test(line)
        return (
          <div key={i} className="section-header mt-2 mb-0.5 text-primary-600 font-bold whitespace-pre">
            {line}
          </div>
        )
      }

      // Detect chord lines using shared utility
      const trimmed = line.trim()
      if (trimmed.length > 0 && isChordLine(line)) {
        return (
          <div key={i} className="chord-line text-primary-600 font-bold whitespace-pre">
            {line}
          </div>
        )
      }

      // Empty line
      if (trimmed.length === 0) {
        return <div key={i} className="whitespace-pre">{'\u00A0'}</div>
      }

      // Text line: bold if inside refrão section
      return (
        <div key={i} className={`whitespace-pre text-gray-900 ${inRefrao ? 'font-bold' : ''}`}>
          {line}
        </div>
      )
    })
  }

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-100 rounded-lg no-print">
        {/* Tom */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Tom:</span>
          {currentTom && (
            <span className="text-sm font-bold text-primary-600">{currentTom}</span>
          )}
          <button
            onClick={() => setTranspose((t) => t - 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Diminuir tom"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setTranspose((t) => t + 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
          <span className="text-sm font-medium text-gray-700">Fonte:</span>
          <button
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Diminuir fonte"
          >
            <span className="text-xs font-bold">A-</span>
          </button>
          <span className="text-xs font-medium w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      {/* Conteúdo da cifra (A4 printable) */}
      <div
        ref={printRef}
        className="cifra-sheet bg-white sm:rounded-lg sm:border border-gray-200"
      >
        {/* Header da cifra (aparece na impressão) */}
        {(title || artist) && (
          <div className="cifra-header mb-3 pb-2 border-b border-gray-200">
            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
            <div className="flex gap-4 text-sm text-gray-600">
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
