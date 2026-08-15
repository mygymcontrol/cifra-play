const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pqddnuoxdvtlqcvziwcc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw'
)

const newContent = `O SANGUE BETHEL MUSIC COMPOSIÇÃO DE: BETHEL MUSIC / DAVID FUNK / DANTE BOWE / MITCH WONG / JENN JOHNSON TOM: D [INTRO] D

D                D/F#:G                                            D
TUDO MUDOU, EU NÃO RECONHEÇO MAIS, AQUELE QUEM FUI ANTES DE TE ENCONTRAR
D                D/F#:G                                            D
EU NÃO SOU MAIS O MESMO, EU DEIXEI O PASSADO, O MEU SER FOI LAVADO, O MEU SER FOI LAVADO

[REFRÃO]
D       D/F#:G                                D
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE
D       D/F#:G                                D  D : D/F#:G
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE

D                D/F#:G                                            D
NADA É MAIS REAL, EU NÃO POSSO EXPLICAR, NA PRESENÇA DE DEUS O QUE EU PUDE EXPERIMENTAR
D                D/F#:G                                            D
MINHA VERGONHA TIROU, MEU PASSADO APAGOU, O MEU SER FOI LAVADO, O MEU SER FOI LAVADO

[REFRÃO]
D       D/F#:G                                D
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE
D       D/F#:G
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE

[SOLO] (D : D/F#:G) (D: D/F#:G)

[PONTE]
 D                                                    D/F#:G
NÃO SE TRATA DE APARÊNCIA, PERFEIÇÃO OU SOBRE ACEITAÇÃO, É POR MEIO DO SANGUE DE JESUS
 D                                                    D/F#:G
NÃO SE TRATA DO QUE MEREÇO, OU ALCANÇO, POIS DE GRAÇA EU RECEBO, É POR MEIO DO SANGUE DE JESUS
 D                                                    D/F#:G
E AQUELE QUE DESEJA SER SANTO, JUSTO, E TER UM CORAÇÃO PURO, É POR MEIO DO SANGUE DE JESUS
 BM          D                                        D/F#:G
E AQUELE QUE DESEJA SER DIGNO, PERDOADO, LIVRE E JUSTIFICADO, É POR MEIO DO SANGUE DE JESUS

[REFRÃO]
D       D/F#:G                                D
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE
D       D/F#:G
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE

[SOLO / MINISTRAÇÃO] (D :D/F#:G) (BM :D : D/F#:G)

[REFRÃO] C/ IGREJA
D       D/F#:G                                D
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE
D       D/F#:G                                D  D : D/F#:G
ALELUIA, ALELUIA, EU SEI QUE FOI O SANGUE, FOI TUDO PELO SANGUE

D                D/F#:G                                            D
EU NÃO POSSO EXPLICAR, E NÃO HÁ COMO AGRADECER, JESUS TUA GRAÇA, E MISERICÓRDIA POR NÓS
D                D/F#:G                                            D
EU TE AMO PRA SEMPRE, SOB A TERRA E O CÉU, O MEU SER FOI LAVADO, O MEU SER FOI LAVADO`

async function update() {
  const { error } = await supabase
    .from('cifras')
    .update({ 
      content: newContent,
      title: 'O SANGUE BETHEL-ESTENDIDA',
      artist: 'BETHEL MUSIC',
      tom: 'D'
    })
    .eq('id', 'faad391b-af11-4ce3-b179-dd581cbb1ed4')

  if (error) {
    console.error('Erro:', error.message)
  } else {
    console.log('✅ Cifra "O SANGUE BETHEL-ESTENDIDA" atualizada com sucesso!')
  }
}

update()
