const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pqddnuoxdvtlqcvziwcc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw'
)

const USER_ID = 'eb9f300c-f166-4478-8467-52d7b65d3a0d'

const sarca = `ENTRE A SARÇA E A GLÓRIA - COMPOSIÇÃO: LUCAS DONHA, ISAAC PADILHA TOM: C COMPASSO: 4/4 BPM: 68
INTRO C9  F9 / Gsus4  F9

[VERSO 1]
C9                            F9
TUA FACE ESTOU PROCURANDO, TUA PRESENÇA É O QUE MAIS DESEJO
      Dm7        F9            C9
MOISÉS VIU A GLORIA, E EU QUERO VER TAMBÉM

[PRÉ REFRÃO]
C9                    F9/7M                          Am7      F9/7M
SHEKINAH LUGAR DE TUA HABITAÇÃO, SHEKINAH EU ABRO O MEU CORAÇÃO, MEU CORAÇÃO

INSTRUMENTAL (C, D, E, G, D)

[VERSO 1]
C9                              F9
ELE VEM QUANDO ESTOU PROCURANDO, ELE VEM QUANDO ME SANTIFICO
      Dm7        F9            C9
MOISÉS VIU A GLORIA, E EU QUERO VER TAMBÉM

[PRÉ REFRÃO]
C9                    F9/7M                          Am7      F9/7M
SHEKINAH LUGAR DE TUA HABITAÇÃO, SHEKINAH EU ABRO O MEU CORAÇÃO, MEU CORAÇÃO
C9                    F9/7M                          Am7      F9/7M
SHEKINAH LUGAR DE TUA HABITAÇÃO, SHEKINAH EU ABRO O MEU CORAÇÃO, MEU CORAÇÃO

2x REFRÃO ( C,D,E,G/G,A,E,D/GAE,D)
C9                                    F9/7M
EU JÁ VI A SARÇA ARDER, EU JÁ VI OS TEUS SINAIS, MAS QUERO MAIS, EU QUERO MAIS
C/E                                   F9/7M
EU JÁ VI O MAR SE ABRIR, EU JÁ VI OS TEUS SINAIS, MAS QUERO MAIS, EU QUERO MAIS

[PONTE]
C9   Csus4   C9   Csus4
GLÓRIA, GLÓRIA, GLÓRIA, GLÓRIA

[PONTE] (CONSTRUINDO)
C/E   F9    C/G    F/A
GLÓRIA, GLÓRIA, GLÓRIA, GLÓRIA

2x REFRÃO ( C,D,E,G/G,A,E,D/GAE,D)
C9                                    F9/7M
EU JÁ VI A SARÇA ARDER, EU JÁ VI OS TEUS SINAIS, MAS QUERO MAIS, EU QUERO MAIS
C/E                                   F9/7M
EU JÁ VI O MAR SE ABRIR, EU JÁ VI OS TEUS SINAIS, MAS QUERO MAIS, EU QUERO MAIS

[PONTE]
C9   Csus4   C9   Csus4
GLÓRIA, GLÓRIA, GLÓRIA, GLÓRIA

[PONTE] (CONSTRUINDO)
C/E   F9    C/G    F/A
GLÓRIA, GLÓRIA, GLÓRIA, GLÓRIA`

const fogo = `O QUE TEM NESSE FOGO – AC MUSIC - COMPOSIÇÃO: LUCAS DONHA TOM: C COMPASSO: 4/4 BPM: 68
INTRO Dm7  F9  Am7 / Dm7  F9  Am7

[VERSO 1]
Am7                        F9
O QUE TEM NESTE FOGO? PODE SER O QUARTO HOMEM NA FORNALHA
Am7                        F9
O QUE TEM NESTE FOGO? PODE SER O QUE ELIAS VIU CAIR DO CÉU

[VERSO 2]
Am7                        F9
O QUE TEM NESTE FOGO? PODE SER A PROTEÇÃO NA NOITE FRIA
Am7                        F9
O QUE TEM NESTE FOGO? PODE SER AS CARRUAGENS QUE ELISEU VIU

4x PRÉ REFRÃO (2X VOZ BAIXA / 2X OITAVA)
 Dm7             C/E   F9                     Am7
MAS NA SARÇA COM MOISÉS, TINHA UMA VOZ QUE MUDOU SEU CORAÇÃO
 Dm7               C/E  F9                    Am7
NÃO APENAS SENTIMENTO OU EMOÇÃO, MAS O FOGO QUE TRANSFORMA

2x REFRÃO
F9       Dm7        C       C/E
EU VOU ME APROXIMAR DO FOGO, DA GLÓRIA
F9       Dm7        C          C/E
PODE ME TRANSFORMAR DE DENTRO PRA FORA

2x PRÉ REFRÃO (C/ RIFF NA PRIMEIRA / VOCAL OITAVADO)
 Dm7             C/E   F9                     Am7
MAS NA SARÇA COM MOISÉS, TINHA UMA VOZ QUE MUDOU SEU CORAÇÃO
 Dm7               C/E  F9                    Am7  G
NÃO APENAS SENTIMENTO OU EMOÇÃO, MAS O FOGO QUE TRANSFORMA

2x REFRÃO (NA PEGADA)
F9       Dm7        C       C/E
EU VOU ME APROXIMAR DO FOGO, DA GLÓRIA
F9       Dm7        C          C/E
PODE ME TRANSFORMAR DE DENTRO PRA FORA

TAG 1 (C/ IGREJA)
F9       Dm7        C          C/E
PODE ME TRANSFORMAR DE DENTRO PRA FORA

TAG 2 (C/ IGREJA)
F9       Dm7        C       C/E
PODE ME TRANSFORMAR DE NOVO AGORA`

async function insert() {
  const cifras = [
    { title: 'ENTRE A SARÇA E A GLÓRIA', artist: 'LUCAS DONHA / ISAAC PADILHA', content: sarca, tom: 'C', user_id: USER_ID, is_public: true },
    { title: 'O QUE TEM NESSE FOGO', artist: 'AC MUSIC', content: fogo, tom: 'C', user_id: USER_ID, is_public: true },
  ]

  for (const c of cifras) {
    const { error } = await supabase.from('cifras').insert(c)
    if (error) {
      console.error(`Erro em "${c.title}":`, error.message)
    } else {
      console.log(`✅ "${c.title}" inserida`)
    }
  }
}

insert()
