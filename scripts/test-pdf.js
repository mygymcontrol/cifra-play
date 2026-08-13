const { google } = require('googleapis')
const pdf = require('pdf-parse')
const path = require('path')

async function test() {
  // Connect to Drive
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '..', 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })

  // Get first PDF
  const res = await drive.files.list({
    q: "'1-FkUztk5ZyOcQa7lwJz8BuJE1JMjEsXu' in parents and mimeType='application/pdf' and trashed=false",
    fields: 'files(id, name)',
    pageSize: 1,
  })

  const file = res.data.files[0]
  console.log('Arquivo:', file.name)

  // Download
  const dlRes = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'arraybuffer' }
  )
  const buffer = Buffer.from(dlRes.data)
  console.log('Tamanho:', buffer.length, 'bytes')

  // Parse PDF
  const data = await pdf(buffer)
  console.log('Paginas:', data.numpages)
  console.log('\n--- CONTEUDO (primeiros 800 chars) ---')
  console.log(data.text.substring(0, 800))
}

test().catch(e => console.error('ERRO:', e.message))
