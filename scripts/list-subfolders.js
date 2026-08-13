const { google } = require('googleapis')
const path = require('path')

async function listSubfolders() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '..', 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })

  const res = await drive.files.list({
    q: "'1-FkUztk5ZyOcQa7lwJz8BuJE1JMjEsXu' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id, name)',
    pageSize: 100,
  })

  console.log(`Subpastas encontradas: ${res.data.files.length}`)
  for (const folder of res.data.files) {
    // Count PDFs in each subfolder
    const pdfRes = await drive.files.list({
      q: `'${folder.id}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id)',
      pageSize: 1000,
    })
    console.log(`  📁 ${folder.name} (${pdfRes.data.files.length} PDFs) - ID: ${folder.id}`)
  }
}

listSubfolders().catch(e => console.error('ERRO:', e.message))
