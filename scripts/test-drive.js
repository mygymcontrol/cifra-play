const { google } = require('googleapis')
const path = require('path')

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '..', 'google-service-account.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })

  const res = await drive.files.list({
    q: "'1-FkUztk5ZyOcQa7lwJz8BuJE1JMjEsXu' in parents and trashed=false",
    fields: 'files(id, name)',
    pageSize: 5,
  })

  console.log('✅ Conexao OK!')
  console.log(`Arquivos encontrados (mostrando 5 de muitos):`)
  res.data.files.forEach(f => console.log(`  - ${f.name}`))
}

test().catch(e => console.error('❌ ERRO:', e.message))
