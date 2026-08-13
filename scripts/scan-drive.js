const { google } = require('googleapis')
const path = require('path')

async function scan() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '..', 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })

  const FOLDER_ID = '1-FkUztk5ZyOcQa7lwJz8BuJE1JMjEsXu'

  // List ALL files (not just PDFs) in root folder
  console.log('=== TODOS os arquivos na pasta raiz ===')
  let allFiles = []
  let pageToken = null
  do {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 1000,
      pageToken,
    })
    allFiles = allFiles.concat(res.data.files || [])
    pageToken = res.data.nextPageToken
  } while (pageToken)

  // Group by mimeType
  const byType = {}
  allFiles.forEach(f => {
    byType[f.mimeType] = (byType[f.mimeType] || 0) + 1
  })

  console.log(`Total de arquivos: ${allFiles.length}`)
  console.log('\nPor tipo:')
  Object.entries(byType).sort((a,b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${count}x ${type}`)
  })

  // List subfolders
  const folders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder')
  if (folders.length > 0) {
    console.log(`\n=== SUBPASTAS (${folders.length}) ===`)
    for (const folder of folders) {
      // Count files in subfolder recursively
      const subRes = await drive.files.list({
        q: `'${folder.id}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType)',
        pageSize: 1000,
      })
      const subFiles = subRes.data.files || []
      const subPdfs = subFiles.filter(f => f.mimeType === 'application/pdf').length
      const subFolders = subFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder').length
      console.log(`  📁 ${folder.name} → ${subFiles.length} arquivos (${subPdfs} PDFs, ${subFolders} subpastas) - ID: ${folder.id}`)
    }
  }
}

scan().catch(e => console.error('ERRO:', e.message))
