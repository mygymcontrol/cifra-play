const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pqddnuoxdvtlqcvziwcc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function removeDuplicates() {
  console.log('🔍 Buscando todas as cifras...')

  const { data: cifras, error } = await supabase
    .from('cifras')
    .select('id, title, content')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro:', error.message)
    return
  }

  console.log(`Total de cifras: ${cifras.length}`)

  // Find duplicates (same title + same content)
  const seen = new Map() // key: title+content hash -> first id
  const toDelete = []

  for (const cifra of cifras) {
    const key = `${cifra.title}|||${cifra.content.trim()}`
    if (seen.has(key)) {
      toDelete.push(cifra.id)
    } else {
      seen.set(key, cifra.id)
    }
  }

  console.log(`\n📊 Resultado:`)
  console.log(`   Únicas: ${seen.size}`)
  console.log(`   Duplicatas encontradas: ${toDelete.length}`)

  if (toDelete.length === 0) {
    console.log('\n✅ Nenhuma duplicata!')
    return
  }

  // Delete in batches of 50
  console.log(`\n🗑️  Deletando ${toDelete.length} duplicatas...`)
  const batchSize = 50
  let deleted = 0

  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize)
    const { error: delError } = await supabase
      .from('cifras')
      .delete()
      .in('id', batch)

    if (delError) {
      console.error(`Erro ao deletar batch: ${delError.message}`)
    } else {
      deleted += batch.length
      console.log(`   Deletadas: ${deleted}/${toDelete.length}`)
    }
  }

  console.log(`\n✅ Pronto! ${deleted} duplicatas removidas. Restam ${seen.size} cifras únicas.`)
}

removeDuplicates().catch(e => console.error('Erro fatal:', e.message))
