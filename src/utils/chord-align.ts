/**
 * Alinhamento de acordes para fonte monospace.
 *
 * Duas situações:
 * 1. Cifras já em monospace (inseridas manualmente): cada acorde já está
 *    posicionado corretamente com espaços. NÃO devemos mexer.
 * 2. Cifras extraídas de PDF com fonte proporcional: o espaçamento foi
 *    calculado para fonte proporcional (Arial), então ao renderizar em
 *    monospace os acordes ficam "esticados" além do texto.
 *
 * Heurística: se a linha de acordes termina MUITO além do fim do texto
 * abaixo dela (indício de espaçamento inflado de PDF proporcional),
 * reposicionamos os acordes proporcionalmente. Caso contrário, mantemos.
 */

import { isChordLine } from './chord-detection'
import { isSectionLine } from './section-detection'

export function normalizeChordSpacing(content: string): string {
  const lines = content.split('\n').map((l) => l.replace(/\t/g, '        '))
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.length > 0 && isChordLine(line) && !isSectionLine(line)) {
      const nextLine = lines[i + 1]
      const hasTextBelow =
        nextLine &&
        nextLine.trim().length > 0 &&
        !isChordLine(nextLine) &&
        !isSectionLine(nextLine)

      if (hasTextBelow) {
        result.push(alignChordsToText(line, nextLine))
      } else {
        result.push(line.replace(/\s+$/, ''))
      }
    } else {
      result.push(line.replace(/\s+$/, ''))
    }
  }

  return result.join('\n')
}

/**
 * Reposiciona acordes só quando detecta espaçamento proporcional inflado.
 */
function alignChordsToText(chordLine: string, textLine: string): string {
  // Extrai acordes com posições
  const chords: { chord: string; pos: number }[] = []
  const regex = /(\S+)/g
  let match
  while ((match = regex.exec(chordLine)) !== null) {
    chords.push({ chord: match[1], pos: match.index })
  }
  if (chords.length === 0) return chordLine.replace(/\s+$/, '')

  const lastChordEnd = chords[chords.length - 1].pos + chords[chords.length - 1].chord.length
  const textLength = textLine.replace(/\s+$/, '').length

  // Só normaliza se os acordes ultrapassam significativamente o texto (> 15%)
  // Isso indica espaçamento proporcional inflado de PDF.
  const overflow = lastChordEnd - textLength
  const needsNormalization = textLength > 0 && overflow > textLength * 0.15

  if (!needsNormalization) {
    // Cifra já alinhada corretamente em monospace — mantém
    return chordLine.replace(/\s+$/, '')
  }

  // Fator de compressão para caber dentro do texto
  const ratio = textLength / lastChordEnd

  let newLine = ''
  for (let i = 0; i < chords.length; i++) {
    let targetPos = Math.round(chords[i].pos * ratio)
    // Garante pelo menos 1 espaço de separação
    if (i > 0 && targetPos <= newLine.length) {
      targetPos = newLine.length + 1
    }
    while (newLine.length < targetPos) newLine += ' '
    newLine += chords[i].chord
  }

  return newLine
}
