const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Regex to match chords in text
const CHORD_REGEX = /\b([A-G][#b]?)(m|dim|aug|sus[24]?|maj|add|[0-9]*)([\/][A-G][#b]?)?\b/g

function noteIndex(note: string): number {
  let idx = NOTES.indexOf(note)
  if (idx === -1) idx = FLAT_NOTES.indexOf(note)
  return idx
}

function transposeNote(note: string, semitones: number): string {
  const idx = noteIndex(note)
  if (idx === -1) return note
  const newIdx = (idx + semitones + 12) % 12
  return NOTES[newIdx]
}

export function transposeChord(chord: string, semitones: number): string {
  return chord.replace(CHORD_REGEX, (match, root, suffix, bass) => {
    const newRoot = transposeNote(root, semitones)
    let newBass = ''
    if (bass) {
      const bassNote = bass.slice(1) // remove "/"
      newBass = '/' + transposeNote(bassNote, semitones)
    }
    return newRoot + (suffix || '') + newBass
  })
}

export function transposeLine(line: string, semitones: number): string {
  if (semitones === 0) return line
  return line.replace(CHORD_REGEX, (match) => transposeChord(match, semitones))
}

export function transposeContent(content: string, semitones: number): string {
  if (semitones === 0) return content
  return content
    .split('\n')
    .map((line) => transposeLine(line, semitones))
    .join('\n')
}

export function getSemitonesBetween(from: string, to: string): number {
  const fromIdx = noteIndex(from)
  const toIdx = noteIndex(to)
  if (fromIdx === -1 || toIdx === -1) return 0
  return (toIdx - fromIdx + 12) % 12
}
