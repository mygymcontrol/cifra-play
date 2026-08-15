import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const DEFAULT_PASSWORD = 'cifra-play-2024-access'

export async function POST(request: Request) {
  const { email } = await request.json()
  const normalizedEmail = email.toLowerCase().trim()

  const admin = createAdminClient()

  // Verificar se o email está autorizado
  const { data: allowed } = await admin
    .from('allowed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  if (!allowed) {
    return NextResponse.json(
      { error: 'Este e-mail não está autorizado.' },
      { status: 403 }
    )
  }

  // Verificar se o usuário já existe
  const { data: { users } } = await admin.auth.admin.listUsers()
  const existingUser = users?.find(u => u.email === normalizedEmail)

  if (existingUser) {
    // Usuário já existe — atualizar senha para a padrão
    await admin.auth.admin.updateUserById(existingUser.id, {
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    })
  } else {
    // Criar novo usuário
    const { error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: normalizedEmail.split('@')[0] },
    })

    if (createError) {
      return NextResponse.json(
        { error: 'Erro ao criar conta.' },
        { status: 500 }
      )
    }
  }

  // Retornar sucesso — o client fará o signIn com a senha padrão
  return NextResponse.json({ success: true })
}
