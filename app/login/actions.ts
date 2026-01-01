'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { seedUserData } from '@/app/actions/seedUserData'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  try {
    await seedUserData()
  } catch (e) {
    return redirect('/login?error=' + encodeURIComponent('Failed to seed initial data: ' + (e instanceof Error ? e.message : 'Unknown error')))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (!data.session) {
    return redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account.'))
  }

  try {
    await seedUserData()
  } catch (e) {
    return redirect('/login?error=' + encodeURIComponent('Failed to seed initial data: ' + (e instanceof Error ? e.message : 'Unknown error')))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
