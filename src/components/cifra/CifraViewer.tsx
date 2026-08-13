'use client'

import { useState, useRef } from 'react'
import { transposeContent } from '@/utils/transpose'
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
    return lines.map((line, i) => {
      // Detect section headers like [Verso], [Refrão], [INTRO], etc.
      const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*(.*)$/)
      if (sectionMatch) {
        return (
          <div key={i} className="section-header mt-4 mb-1">
            <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded uppercase tracking-wide">
              {sectionMatch[1]}
            </span>
            {sectionMatch[2] && <span className="ml-2">{sectionMatch[2]}</span>}
          </div>
        )
      }

      // Detect if line is mostly chords (has many uppercase single letters with # or b)
      const chordPattern = /^[\s]*([A-G][#b]?[m]?[0-9]?(?:sus|dim|aug|maj|add|\/[A-G][#b]?)?[\s]*)+$/
      const isChordLine = chordPattern.test(line) && line.trim().length > 0

      if (isChordLine) {
        return (
          <div key={i} className="chord-line text-primary-600 font-bold whitespace-pre">
            {line}
          </div>
        )
      }

      return (
        <div key={i} className="whitespace-pre">
          {line || '\u00A0'}
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
        className="cifra-sheet bg-white rounded-lg border border-gray-200 overflow-x-auto"
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
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
        >
          {renderContent(displayContent)}
        </div>
      </div>
    </div>
  )
}
