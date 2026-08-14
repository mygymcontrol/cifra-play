/**
 * Detecta se uma linha contém acordes e deve ser destacada em azul.
 * 
 * Regras:
 * - Linha onde a maioria das "palavras" são acordes válidos
 * - Linhas que começam com INSTRUMENTAL, SOLO, INTERLÚDIO, INTRO seguido de acordes
 * - Linhas com acordes + anotações entre parênteses (ex: "G EM C (espera +um tempo)")
 * - Linhas com marcadores como "2x", "4x" junto com acordes
 * - Acordes com notação estendida: D/F#:G, Bb/D, C#m7, etc.
 */

// Acorde: A-G, opcionais #/b/♯/♭, opcionais m/dim/aug/sus/maj/add/números, opcionais /baixo, opcionais :acorde
const CHORD_REGEX = /^[A-G][#b♯♭]?(?:[mM]|[dD][iI][mM]|[aA][uU][gG]|[sS][uU][sS][24]?|[mM][aA][jJ]|[aA][dD][dD]|[0-9])*(?:\/[A-G][#b♯♭]?(?:[0-9])?)?(?:[:]?[A-G][#b♯♭]?(?:[mM]|[dD][iI][mM]|[aA][uU][gG]|[sS][uU][sS][24]?|[mM][aA][jJ]|[aA][dD][dD]|[0-9])*(?:\/[A-G][#b♯♭]?)?)?$/

// Palavras que indicam contexto musical (não são acordes, mas fazem parte de linhas de acordes)
const MUSICAL_KEYWORDS = /^(?:intro|instrumental|solo|interlúdio|interlude|interludio|ponte|bridge|riff|tab|final|coda|outr[oa]?)$/i

// Padrões de repetição (2x, 4x, etc.)
const REPEAT_PATTERN = /^\d+x$/i

// Separadores musicais como ":" ou "|" isolados
const SEPARATOR_PATTERN = /^[:|/|\-|]$/

export function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length === 0) return false

  // Remove conteúdo entre parênteses para análise
  const withoutParens = trimmed.replace(/\([^)]*\)/g, '').trim()
  if (withoutParens.length === 0) return false

  const words = withoutParens.split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return false

  let chordCount = 0
  let musicalKeywordCount = 0

  for (const word of words) {
    if (CHORD_REGEX.test(word)) {
      chordCount++
    } else if (MUSICAL_KEYWORDS.test(word)) {
      musicalKeywordCount++
    } else if (REPEAT_PATTERN.test(word)) {
      // "2x", "4x" etc. — contexto musical, não quebra
      musicalKeywordCount++
    } else if (SEPARATOR_PATTERN.test(word)) {
      // ":" or "|" separators between chords
      musicalKeywordCount++
    }
  }

  // É linha de acorde se:
  // 1. Tem pelo menos 1 acorde E
  // 2. Todos os "outros" são keywords musicais ou repetições (ou seja, não tem letra/frase)
  const nonChordNonKeyword = words.length - chordCount - musicalKeywordCount
  
  if (chordCount >= 1 && nonChordNonKeyword === 0) {
    return true
  }

  // Ou se mais de 60% são acordes e tem pelo menos 2 acordes
  if (chordCount >= 2 && (chordCount / words.length) >= 0.5) {
    return true
  }

  return false
}
