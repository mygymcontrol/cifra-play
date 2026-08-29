/**
 * Alinhamento de acordes para fonte monospace.
 *
 * As cifras são armazenadas com espaçamento monospace correto (cada acorde
 * posicionado exatamente acima da sílaba correspondente por meio de espaços).
 * Como a renderização usa fonte monospace (Courier New), o espaçamento
 * original já produz o alinhamento correto.
 *
 * Portanto NÃO reprocessamos o espaçamento — qualquer tentativa de
 * "recalcular" posições por proporção quebra o alinhamento já correto.
 * Apenas normalizamos tabs para espaços (tabs têm largura variável).
 */

export function normalizeChordSpacing(content: string): string {
  // Converte tabs em espaços (tab = 8 espaços em monospace por padrão)
  // e remove espaços à direita que não afetam alinhamento.
  return content
    .split('\n')
    .map((line) => line.replace(/\t/g, '        ').replace(/\s+$/, ''))
    .join('\n')
}
