'use client'

import { useState } from 'react'
import { transposeContent } from '@/utils/transpose'
import { NOTES } from '@/types'

interface CifraViewerProps {
  content: string
  originalTom: string | null
}

export function CifraViewer({ content, originalTom }: CifraViewerProps) {
  const [transpose, setTranspose] = useState(0)

  const displayContent = transposeContent(content, transpose)
  const currentTom = originalTom
    ? NOTES[(NOTES.indexOf(originalTom as any) + transpose + 12) % 12]
    : null

  return (
    <div>
      {/* Controles de transposição */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-100 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Tom:</span>
        {currentTom && (
          <span className="text-sm font-bold text-primary-600">{currentTom}</span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setTranspose((t) => t - 1)}
            className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Diminuir tom"
          >
            -
          </button>
          <span className="text-sm font-medium w-6 text-center">{transpose}</span>
          <button
            onClick={() => setTranspose((t) => t + 1)}
            className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Aumentar tom"
          >
            +
          </button>
          {transpose !== 0 && (
            <button
              onClick={() => setTranspose(0)}
              className="text-xs text-primary-600 hover:underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo da cifra */}
      <pre className="cifra-content text-sm leading-relaxed overflow-x-auto p-4 bg-white rounded-lg border border-gray-200">
        {displayContent}
      </pre>
    </div>
  )
}
