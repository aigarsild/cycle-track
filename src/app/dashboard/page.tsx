import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

// This is a Server Component that checks authentication
export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get the current session server-side
  const { data: { session } } = await supabase.auth.getSession()
  
  // If no session, redirect to login
  if (!session) {
    redirect('/login?redirectTo=/dashboard')
  }
  
  // If authenticated, render the dashboard client component
  return <DashboardClient serverUser={session.user} />
} 