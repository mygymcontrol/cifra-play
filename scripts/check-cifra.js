const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pqddnuoxdvtlqcvziwcc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const { data } = await supabase
    .from('cifras')
    .select('content')
    .ilike('title', '%CONFIO EM DEUS%')
    .limit(1)

  if (!data || !data[0]) { console.log('not found'); return }
  
  const content = data[0].content
  const lines = content.split('\n')
  
  // Find REFRÃO and show lines around it
  for (let i = 0; i < lines.length; i++) {
    if (/refrão/i.test(lines[i])) {
      console.log(`\n--- REFRÃO encontrado na linha ${i} ---`)
      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        const line = lines[j]
        const display = line === '' ? '(VAZIA)' : line.replace(/ /g, '·')
        console.log(`${j}: [${line.length}] ${display}`)
      }
      break
    }
  }
}
main()
