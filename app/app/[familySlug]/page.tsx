import { getFamilyBySlug } from '@/actions/family'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

interface FamilyPageProps {
  params: {
    familySlug: string
  }
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { familySlug } = await params

  // Validate family exists
  const familyResult = await getFamilyBySlug(familySlug)
  if (!familyResult.success || !familyResult.family) {
    notFound()
  }

  // Redirect to the tree view (main view)
  redirect(`/app/${familySlug}/tree`)
}








