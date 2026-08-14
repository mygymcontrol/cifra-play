import type { Database } from './database'

export type Cifra = Database['public']['Tables']['cifras']['Row']
export type CifraInsert = Database['public']['Tables']['cifras']['Insert']
export type CifraUpdate = Database['public']['Tables']['cifras']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Setlist = Database['public']['Tables']['setlists']['Row']
export type SetlistCifra = Database['public']['Tables']['setlist_cifras']['Row']
export type RepertorioItem = Database['public']['Tables']['repertorio_items']['Row']

// Notas musicais
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export type Note = (typeof NOTES)[number]

// Categorias
export const CATEGORIES = [
  'Louvor',
  'Adoração',
  'Celebração',
  'Comunhão',
  'Ofertório',
  'Natal',
  'Páscoa',
  'Infantil',
  'Outro',
] as const
export type Category = (typeof CATEGORIES)[number]
