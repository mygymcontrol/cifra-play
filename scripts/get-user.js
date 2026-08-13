const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pqddnuoxdvtlqcvziwcc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) { console.error(error); return }
  data.users.forEach(u => console.log(u.id, u.email))
}
main()
