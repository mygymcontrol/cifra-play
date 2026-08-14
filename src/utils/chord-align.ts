/**
 * Realinha acordes em relação ao texto para fonte monospace.
 * 
 * O problema: PDFs usam fonte proporcional, onde "i" é mais estreito que "M".
 * O extrator de PDF preserva espaços baseado na largura proporcional.
 * Quando renderizamos em monospace (Courier New), os acordes ficam deslocados.
 * 
 * Solução: Para cada linha de acorde seguida por uma linha de texto,
 * tentamos manter os acordes nas posições relativas originais,
 * mas ajustadas para a largura monospace.
 * 
 * Na prática, o conteúdo do PDF já foi extraído com espaçamento proporcional.
 * Não temos como saber exatamente onde cada acorde deveria cair sem a fonte original.
 * 
 * Abordagem: Compactamos espaços múltiplos entre acordes para manter
 * os acordes mais próximos das posições reais do texto.
 */

import { isChordLine } from './chord-detection'
import { isSectionLine } from './section-detection'

/**
 * Normaliza o conteúdo da cifra para melhor alinhamento em monospace.
 * - Remove espaços excessivos entre acordes (mais de 2 espaços consecutivos
 *   são reduzidos proporcionalmente)
 * - Mantém pelo menos 1 espaço entre acordes
 */
export function normalizeChordSpacing(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Se é uma linha de acorde (não seção), normaliza espaçamento
    if (trimmed.length > 0 && isChordLine(line) && !isSectionLine(line)) {
      // Verifica se a próxima linha é texto (não vazia, não acorde, não seção)
      const nextLine = lines[i + 1]
      const hasTextBelow = nextLine && nextLine.trim().length > 0 && 
        !isChordLine(nextLine) && !isSectionLine(nextLine)

      if (hasTextBelow) {
        // Reposiciona acordes baseado no comprimento do texto abaixo
        const aligned = alignChordsToText(line, nextLine)
        result.push(aligned)
      } else {
        // Apenas compacta espaços excessivos
        result.push(compactSpaces(line))
      }
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

/**
 * Alinha acordes baseado na proporção do texto abaixo.
 * Usa a razão entre o comprimento original e o texto para reposicionar.
 */
function alignChordsToText(chordLine: string, textLine: string): string {
  // Extrai acordes com suas posições originais
  const chords: { chord: string; pos: number }[] = []
  const regex = /(\S+)/g
  let match

  while ((match = regex.exec(chordLine)) !== null) {
    chords.push({ chord: match[1], pos: match.index })
  }

  if (chords.length === 0) return chordLine

  // Se a linha de acorde original é mais longa que o texto,
  // significa que os espaços estão inflados (fonte proporcional → monospace)
  const originalLength = chordLine.length
  const textLength = textLine.length

  if (originalLength <= textLength || textLength === 0) {
    // Sem necessidade de ajuste — os acordes cabem no texto
    return chordLine
  }

  // Calcula fator de compressão
  const ratio = textLength / originalLength

  // Reconstrói a linha de acordes com posições ajustadas
  let newLine = ''
  for (let i = 0; i < chords.length; i++) {
    const targetPos = Math.round(chords[i].pos * ratio)
    const actualPos = Math.max(targetPos, newLine.length)

    // Adiciona espaços para chegar na posição
    while (newLine.length < actualPos) {
      newLine += ' '
    }

    // Garante pelo menos 1 espaço entre acordes (exceto o primeiro)
    if (i > 0 && newLine.length === actualPos && newLine.length > 0 && newLine[newLine.length - 1] !== ' ') {
      newLine += ' '
    }

    newLine += chords[i].chord
  }

  return newLine
}

/**
 * Compacta espaços excessivos mantendo proporcionalidade.
 */
function compactSpaces(line: string): string {
  // Reduz sequências de 4+ espaços pela metade
  return line.replace(/ {4,}/g, (spaces) => {
    const newLength = Math.max(2, Math.ceil(spaces.length * 0.6))
    return ' '.repeat(newLength)
  })
}
