/**
 * Detecta se uma linha é um marcador de seção (com ou sem colchetes).
 * 
 * Exemplos que devem ser detectados:
 * - [INTRO] G EM C
 * - [REFRÃO]
 * - 4x[PONTE]
 * - 2x[PONTE]
 * - INSTRUMENTAL 2x G EM C
 * - INTERLÚDIO G EM C
 * - SOLO
 * - PRÉ-REFRÃO
 * - REFRÃO C/ IGREJA
 */

const SECTION_KEYWORDS = [
  'INTRO',
  'INTRODUÇÃO',
  'VERSO',
  'PRÉ-REFRÃO',
  'PRE-REFRÃO',
  'REFRÃO',
  'PONTE',
  'BRIDGE',
  'SOLO',
  'INTERLÚDIO',
  'INTERLUDIO',
  'INSTRUMENTAL',
  'FINAL',
  'CODA',
  'OUTRO',
  'OUTRA',
  'RIFF',
  'TAB',
  'CORO',
  'RAMPA',
  'PRIMEIRA PARTE',
  'SEGUNDA PARTE',
  'TERCEIRA PARTE',
]

// Regex that matches section patterns
const SECTION_REGEX = new RegExp(
  `^\\s*(?:\\d+x\\s*)?\\[?(?:${SECTION_KEYWORDS.join('|')})\\]?`,
  'i'
)

export function isSectionLine(line: string): boolean {
  return SECTION_REGEX.test(line.trim())
}

export { SECTION_KEYWORDS }
