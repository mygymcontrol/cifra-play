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
  
  // Simulate the PASSO 1 logic
  let inRefrao = false
  
  for (let i = 0; i < lines.length; i++) {
    const isEmpty = !lines[i] || /^\s*$/.test(lines[i])
    
    if (isEmpty) {
      if (inRefrao) console.log(`  Line ${i}: EMPTY -> ending refrão`)
      inRefrao = false
      continue
    }
    
    const sectionMatch = lines[i].trim().match(/^\[([^\]]+)\]/)
    if (sectionMatch) {
      inRefrao = /refrão|refrao|coro/i.test(sectionMatch[1])
      console.log(`  Line ${i}: SECTION [${sectionMatch[1]}] -> inRefrao=${inRefrao}`)
    }
    
    if (i >= 10 && i <= 25) {
      console.log(`  Line ${i}: inRefrao=${inRefrao} | "${lines[i].substring(0, 50)}"`)
    }
  }
}
main()
