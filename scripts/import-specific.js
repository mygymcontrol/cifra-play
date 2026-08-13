const { google } = require('googleapis')
const pdf = require('pdf-parse')
const { createClient } = require('@supabase/supabase-js')
const path = require('path')

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'google-service-account.json')
const SUPABASE_URL = 'https://pqddnuoxdvtlqcvziwcc.supabase.co'
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw'
const USER_ID = 'eb9f300c-f166-4478-8467-52d7b65d3a0d'

const FILE_IDS = [
  '10gH5XKBNbGSZSmpxeROIuaVJ3_fM-v8B',
  '1DS0d0AFl4mGU68ZomiEBfg9KWtH35b7n',
  '1EimXqJ1YFCRV-v9S18_dhyUXpSfNsOdJ',
  '1osz0cGa09MXi1g3JCWhobbJyuhI41EDn',
  '1paQg_qpCdyWRU0fJhf9OZYKSazF3Bc63',
  '1PkHVo99GbUeKXslBYig1H5pN8igHeBEb',
  '1bzYmNR4JJNhgg7mZnKFuxnRTMQKahyGY',
  '19AgY5xOIKmf7xxAor3U0YWTSdEN8syoX',
]

function parseFilename(filename) {
  const name = filename.replace('.pdf', '').trim()
  const dashParts = name.split(' - ')
  if (dashParts.length >= 2) {
    const lastPart = dashParts[dashParts.length - 1].trim()
    const isTom = /^[A-G][#b]?m?$/.test(lastPart)
    return { title: dashParts[0].trim(), artist: dashParts.length > 2 ? dashParts[1].trim() : 'Desconhecido', detectedTom: isTom ? lastPart : null }
  }
  return { title: name, artist: 'Desconhecido', detectedTom: null }
}

function detectTom(content) {
  const tomMatch = content.match(/(?:Tom|Key|Tom\s*Original)\s*[:=]\s*([A-G][#b]?m?)/i)
  if (tomMatch) return tomMatch[1]
  return null
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } })

  console.log(`🚀 Importando ${FILE_IDS.length} arquivos...\n`)

  let imported = 0, errors = 0

  for (let i = 0; i < FILE_IDS.length; i++) {
    const fileId = FILE_IDS[i]
    try {
      // Get file metadata
      const meta = await drive.files.get({ fileId, fields: 'name' })
      const filename = meta.data.name
      console.log(`[${i+1}/${FILE_IDS.length}] ${filename}`)

      // Download
      const dlRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(dlRes.data)

      // Parse PDF
      const data = await pdf(buffer)
      let content = data.text || ''

      if (!content.trim()) {
        console.log(`   ⚠️  PDF sem texto`)
        errors++
        continue
      }

      const { title, artist, detectedTom } = parseFilename(filename)
      const tom = detectTom(content) || detectedTom

      const { error: insertError } = await supabase.from('cifras').insert({
        title, artist, content: content.trim(), tom, user_id: USER_ID, is_public: true, category: null,
      })

      if (insertError) {
        console.log(`   ❌ ${insertError.message}`)
        errors++
      } else {
        console.log(`   ✅ Importada!`)
        imported++
      }
    } catch (err) {
      console.log(`   ❌ ${err.message}`)
      errors++
    }
  }

  console.log(`\n📊 Resultado: ✅ ${imported} importadas, ❌ ${errors} erros`)
}

main().catch(e => console.error('Erro fatal:', e.message))
