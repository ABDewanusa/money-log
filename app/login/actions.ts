'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { seedUserData } from '@/app/actions/seedUserData'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-safe extraction could be done with Zod, but keeping it minimal as requested
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Seed data on login
  try {
    await seedUserData()
  } catch (e) {
    // If seeding fails, we should probably log it but maybe not block login entirely?
    // User constraints say "Fail loudly if seed fails".
    // So we will return the error.
    return { error: 'Failed to seed initial data: ' + (e instanceof Error ? e.message : 'Unknown error') }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Seed data on signup
  try {
    await seedUserData()
  } catch (e) {
    return { error: 'Failed to seed initial data: ' + (e instanceof Error ? e.message : 'Unknown error') }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
