import { redirect } from 'next/navigation'
import { getUserFamilies, requireAuth } from '@/lib/auth'

export default async function AppPage() {
  const user = await requireAuth()
  const userFamilies = await getUserFamilies(user.id)
  
  if (!userFamilies || userFamilies.length === 0) {
    redirect('/app/onboarding')
  }

  // Redirect to the first family
  redirect(`/app/${userFamilies[0].family.slug}`)
}
