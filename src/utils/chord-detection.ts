/**
 * Detecta se uma linha contém acordes e deve ser destacada em azul.
 * 
 * Regras:
 * - Linha onde a maioria das "palavras" são acordes válidos
 * - Linhas entre parênteses com acordes: ( AM G/B C G F )
 * - Linhas com INSTRUMENTAL, SOLO, INTERLÚDIO, INTRO seguido de acordes
 * - Linhas com acordes + anotações entre parênteses
 * - Linhas com marcadores como "2x", "4x" junto com acordes
 * - Acordes com notação estendida: D/F#:G, Bb/D, C#m7, G7M, etc.
 * - Indicadores: # (sustenido), / (baixo), múltiplas consoantes sem vogais
 */

// Acorde: A-G, opcionais #/b/♯/♭, opcionais m/dim/aug/sus/maj/add/números, opcionais /baixo, opcionais :acorde
const CHORD_REGEX = /^[A-G][#b♯♭]?(?:[mM]|[dD][iI][mM]|[aA][uU][gG]|[sS][uU][sS][24]?|[mM][aA][jJ]|[aA][dD][dD]|[0-9])*(?:\([0-9]+\))?(?:\/[A-G][#b♯♭]?(?:[mM]|[0-9])*)?(?:[:]?[A-G][#b♯♭]?(?:[mM]|[dD][iI][mM]|[aA][uU][gG]|[sS][uU][sS][24]?|[mM][aA][jJ]|[aA][dD][dD]|[0-9])*(?:\/[A-G][#b♯♭]?)?)?$/

// Palavras que indicam contexto musical (não são acordes, mas fazem parte de linhas de acordes)
const MUSICAL_KEYWORDS = /^(?:intro|instrumental|solo|interlúdio|interlude|interludio|ponte|bridge|riff|tab|final|coda|outr[oa]?|ministração|c\/|igreja)$/i

// Padrões de repetição (2x, 4x, etc.)
const REPEAT_PATTERN = /^\d+x$/i

// Separadores musicais como ":", "|", "/", "-" isolados
const SEPARATOR_PATTERN = /^[:|/\-|]$/

// Padrões de parênteses isolados
const PAREN_PATTERN = /^[()]$/

export function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length === 0) return false

  // REGRA 1: Se a linha (com ou sem parênteses) é composta principalmente de acordes
  // Remove parênteses externas mas analisa o conteúdo dentro delas
  const cleaned = trimmed
    .replace(/[()]/g, ' ')  // Remove parênteses, substitui por espaço
    .replace(/\s+/g, ' ')   // Normaliza espaços
    .trim()
  
  if (cleaned.length === 0) return false

  const words = cleaned.split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return false

  let chordCount = 0
  let musicalKeywordCount = 0

  for (const word of words) {
    // Trata acordes separados por ":" como múltiplos acordes (ex: D/F#:G)
    const chordParts = word.split(':')
    let allPartsAreChords = true
    for (const part of chordParts) {
      if (part.length > 0 && !CHORD_REGEX.test(part)) {
        allPartsAreChords = false
        break
      }
    }
    
    if (allPartsAreChords && chordParts.some(p => CHORD_REGEX.test(p))) {
      chordCount++
    } else if (MUSICAL_KEYWORDS.test(word)) {
      musicalKeywordCount++
    } else if (REPEAT_PATTERN.test(word)) {
      musicalKeywordCount++
    } else if (SEPARATOR_PATTERN.test(word)) {
      musicalKeywordCount++
    }
  }

  // É linha de acorde se:
  // 1. Tem pelo menos 1 acorde E todos os outros são keywords/separadores
  const nonChordNonKeyword = words.length - chordCount - musicalKeywordCount
  
  if (chordCount >= 1 && nonChordNonKeyword === 0) {
    return true
  }

  // 2. Mais de 50% são acordes e tem pelo menos 2 acordes
  if (chordCount >= 2 && (chordCount / words.length) >= 0.5) {
    return true
  }

  // REGRA 2: Linha contém # e tem padrão de consoantes sem vogais (indica cifra)
  // Ex: "G#M", "F#", "BM7", "D/F#"
  if (trimmed.includes('#') || trimmed.includes('/')) {
    // Contar quantas "palavras" parecem acordes por heurística
    const heuristicWords = cleaned.split(/\s+/)
    let heuristicChordCount = 0
    for (const w of heuristicWords) {
      // Se começa com A-G e tem no máximo 6 chars, ou contém #/b seguido de pouco
      if (/^[A-G]/.test(w) && w.length <= 8 && !/[a-z]{3,}/.test(w)) {
        heuristicChordCount++
      }
    }
    if (heuristicChordCount >= 2 && heuristicChordCount / heuristicWords.length >= 0.5) {
      return true
    }
  }

  return false
}
