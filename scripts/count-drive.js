const { google } = require('googleapis')
const path = require('path')

async function count() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '..', 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })

  let allFiles = []
  let pageToken = null
  do {
    const res = await drive.files.list({
      q: "'1-FkUztk5ZyOcQa7lwJz8BuJE1JMjEsXu' in parents and mimeType='application/pdf' and trashed=false",
      fields: 'nextPageToken, files(id)',
      pageSize: 1000,
      pageToken,
    })
    allFiles = allFiles.concat(res.data.files || [])
    pageToken = res.data.nextPageToken
  } while (pageToken)

  console.log(`Total de PDFs na pasta: ${allFiles.length}`)
}

count().catch(e => console.error('ERRO:', e.message))
