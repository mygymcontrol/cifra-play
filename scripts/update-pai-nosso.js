const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pqddnuoxdvtlqcvziwcc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGRudW94ZHZ0bHFjdnppd2NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxNzkwNywiZXhwIjoyMTAyMTkzOTA3fQ.3Dj2jFjnlAoLY8mjNEhT8LnXHsk2OfPYs3ZashF9sLw'
)

const newContent = `PAI NOSSO PEDRAS VIVAS COMPOSIÇÃO DE: MARKUS MAYER / ANA PAULA VALADÃO / BRIAN JOHNSON (TOM ORIGINAL B)
TOM: A [INTRO] A9  F#M7  D / A9  F#M7  D

 A9          D        E           A9          D    E
PAI NOSSO, NOS CÉUS, SANTO É O TEU NOME - TEU REINO BUSCAMOS, TUA VONTADE SEJA FEITA

[REFRÃO]
 D       A/C#  BM7   F#M7      E
NA TERRA COMO   É, NOS CÉUS, DEIXE O CÉU DESCER
 D       A/C#  BM7   F#M7      E
NA TERRA COMO   É, NOS CÉUS, DEIXE O CÉU DESCER

1X INTRODUÇÃO ( A9  F#M7  D )

 A9          D        E           A9          D    E
PAI NOSSO, NOS CÉUS, SANTO É O TEU NOME - TEU REINO BUSCAMOS, TUA VONTADE SEJA FEITA

[REFRÃO]
 D       A/C#  BM7   F#M7      E
NA TERRA COMO   É, NOS CÉUS, DEIXE O CÉU DESCER
 D       A/C#  BM7   F#M7      E
NA TERRA COMO   É, NOS CÉUS, DEIXE O CÉU...

[CORO]
 D          E:F#M7  E              D          E:F#M7  E
DESCER, DEIXE O CÉU DESCER,      DEIXE O CÉU DESCER, DEIXE O CÉU DESCER

[CORO] (OITAVA A VOZ)
 D          E:F#M7  E              D          E:F#M7  E
DEIXE O CÉU DESCER, DEIXE O CÉU DESCER,   DEIXE O CÉU DESCER, DEIXE O CÉU DESCER

[CORO] (OITAVA A VOZ)
 D          E:F#M7  E              D          E:F#M7  E
DEIXE O CÉU DESCER, DEIXE O CÉU DESCER,   DEIXE O CÉU DESCER, DEIXE O CÉU DESCER

[PONTE]
D7M             F#M7           E6
TEU É O REINO, TEU O PODER, TUA É A GLÓRIA PRA SEMPRE, AMÉM
D7M             F#M7           E6
TEU É O REINO, TEU O PODER, TUA É A GLÓRIA PRA SEMPRE, AMÉM

[INSTRUMENTO](QUER DIZER PARA CONTINUAR TODA A BANDA)
D7M             F#M7           E6
TEU É O REINO, TEU O PODER, TUA É A GLÓRIA PRA SEMPRE, AMÉM

[PONTE]
D7M             F#M7           E6
TEU É O REINO, TEU O PODER, TUA É A GLÓRIA PRA SEMPRE, AMÉM
D7M             F#M7           E6
TEU É O REINO, TEU O PODER, TUA É A GLÓRIA PRA SEMPRE, AMÉM

INSTRUMENTAL/SOLO: D7M  F#M7  E / D7M  F#M7  E

2X[PONTE] (C/ IGREJA)
D7M             F#M7           E6
TEU É O REINO, TEU O PODER, TUA É A GLÓRIA PRA SEMPRE, AMÉM`

async function update() {
  const { error } = await supabase
    .from('cifras')
    .update({ 
      content: newContent,
      title: 'PAI NOSSO',
      artist: 'OUR FATHER',
      tom: 'A'
    })
    .eq('id', 'f2730f4e-9492-4390-a3b8-4c9f3c09240f')

  if (error) {
    console.error('Erro:', error.message)
  } else {
    console.log('✅ Cifra "PAI NOSSO" atualizada com sucesso!')
  }
}

update()
