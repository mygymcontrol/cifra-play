/**
 * Script para importar cifras em PDF do Google Drive para o Supabase.
 * 
 * Uso: node scripts/import-drive.js
 */

const { google } = require('googleapis')
const pdf = require('pdf-parse')
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')

// Configs
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'google-service-account.json')
const FOLDER_ID = '1-FkUztk5ZyOcQa7lwJz8BuJE1JMjEsXu'
const SUPABASE_URL = 'https://pqddnuoxdvtlqcvziwcc.supabase.co'
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw'

// User ID for import
let ADMIN_USER_ID = 'eb9f300c-f166-4478-8467-52d7b65d3a0d' // covalsqui.arrabal1@gmail.com

// Init Google Drive
async function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const authClient = await auth.getClient()
  return google.drive({ version: 'v3', auth: authClient })
}

// Init Supabase (admin)
function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// List all PDFs in folder (handles pagination)
async function listPDFs(drive, folderId) {
  let allFiles = []
  let pageToken = null

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'nextPageToken, files(id, name)',
      pageSize: 100,
      pageToken: pageToken,
    })
    allFiles = allFiles.concat(res.data.files || [])
    pageToken = res.data.nextPageToken
  } while (pageToken)

  return allFiles
}

// Download PDF as buffer
async function downloadPDF(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  )
  return Buffer.from(res.data)
}

// Parse title and artist from filename
// Patterns seen: "NOME ARTISTA - TOM.pdf", "Nome Artista Tom.pdf", "Artist - Title.pdf"
function parseFilename(filename) {
  const name = filename.replace('.pdf', '').trim()
  
  // Try "Title Artist - Tom" pattern (common in this drive)
  const dashParts = name.split(' - ')
  if (dashParts.length >= 2) {
    // Last part might be the Tom (single note like "G", "C", "D#")
    const lastPart = dashParts[dashParts.length - 1].trim()
    const isTom = /^[A-G][#b]?m?$/.test(lastPart)
    
    if (isTom && dashParts.length === 2) {
      return { title: dashParts[0].trim(), artist: 'Desconhecido', detectedTom: lastPart }
    }
    
    if (dashParts.length >= 2) {
      return { 
        title: dashParts[0].trim(), 
        artist: dashParts.length > 2 ? dashParts[1].trim() : 'Desconhecido',
        detectedTom: isTom ? lastPart : null
      }
    }
  }
  
  return { title: name, artist: 'Desconhecido', detectedTom: null }
}

// Detect tom from content
function detectTom(content) {
  // Look for common patterns like "Tom: C", "Tom: Am", etc.
  const tomMatch = content.match(/(?:Tom|Key|Tom\s*Original)\s*[:=]\s*([A-G][#b]?m?)/i)
  if (tomMatch) return tomMatch[1]
  return null
}

// Detect sections in content
function detectSections(content) {
  // Common section markers in Portuguese
  const sectionPatterns = /\[(Intro|Verso|Pré-Refrão|Pre-Refrão|Refrão|Ponte|Bridge|Solo|Final|Coda|Instrumental|Interlude)\]/gi
  
  // Also check for lines that are just section names
  const linePatterns = /^(Intro|Verso|Pré-Refrão|Pre-Refrão|Refrão|Ponte|Bridge|Solo|Final|Coda|Instrumental)\s*:?\s*$/gim
  
  let formatted = content
  // Normalize section markers to [Section] format
  formatted = formatted.replace(linePatterns, '[$1]')
  
  return formatted
}

// Main import function
async function importAll() {
  console.log('🚀 Iniciando importação do Google Drive...\n')
  
  const drive = await getDriveService()
  const supabase = getSupabase()

  console.log(`👤 User ID: ${ADMIN_USER_ID}\n`)

  // Get existing titles to avoid duplicates
  const { data: existingCifras } = await supabase
    .from('cifras')
    .select('title')
    .eq('user_id', ADMIN_USER_ID)
  
  const existingTitles = new Set((existingCifras || []).map(c => c.title))
  console.log(`📋 Cifras já importadas: ${existingTitles.size}\n`)

  // List PDFs
  console.log('📂 Listando PDFs na pasta...')
  const files = await listPDFs(drive, FOLDER_ID)
  console.log(`   Encontrados: ${files.length} PDFs\n`)

  if (files.length === 0) {
    console.log('❌ Nenhum PDF encontrado. Verifique se a pasta foi compartilhada com a Service Account.')
    process.exit(1)
  }

  let imported = 0
  let errors = 0
  const batchSize = 10

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const progress = `[${i + 1}/${files.length}]`

    try {
      // Check for duplicate
      const { title: preTitle } = parseFilename(file.name)
      if (existingTitles.has(preTitle)) {
        console.log(`${progress} ⏭️  ${file.name} (já importada)`)
        continue
      }

      // Download PDF
      const buffer = await downloadPDF(drive, file.id)
      
      // Parse PDF text
      const data = await pdf(buffer)
      let content = data.text || ''
      
      if (!content.trim()) {
        console.log(`${progress} ⚠️  ${file.name} - PDF sem texto (possivelmente imagem)`)
        errors++
        continue
      }

      // Parse metadata
      const { title, artist, detectedTom } = parseFilename(file.name)
      const tom = detectTom(content) || detectedTom
      content = detectSections(content)

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from('cifras')
        .insert({
          title,
          artist,
          content: content.trim(),
          tom,
          user_id: ADMIN_USER_ID,
          is_public: true,
          category: null,
        })

      if (insertError) {
        console.log(`${progress} ❌ ${file.name}: ${insertError.message}`)
        errors++
      } else {
        console.log(`${progress} ✅ ${title} - ${artist}`)
        imported++
      }

    } catch (err) {
      console.log(`${progress} ❌ ${file.name}: ${err.message}`)
      errors++
    }

    // Small delay to avoid rate limits
    if (i % batchSize === 0 && i > 0) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\n📊 Resultado:`)
  console.log(`   ✅ Importadas: ${imported}`)
  console.log(`   ❌ Erros: ${errors}`)
  console.log(`   📁 Total processados: ${files.length}`)
}

importAll().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
