import { getFamilyBySlug } from '@/actions/family'
import { getPersonsPublic } from '@/actions/person'
import { TreeCanvas } from '@/components/tree-canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TreePine } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PublicSharePageProps {
  params: {
    familySlug: string
  }
}

export default async function PublicSharePage({ params }: PublicSharePageProps) {
  const { familySlug } = await params

  // Get family data (public access)
  const familyResult = await getFamilyBySlug(familySlug)
  if (!familyResult.success || !familyResult.family) {
    notFound()
  }

  const family = familyResult.family

  // Get persons data (public access with privacy filtering)
  const personsResult = await getPersonsPublic(family.id)
  if (!personsResult.success || !personsResult.persons) {
    notFound()
  }

  // Filter persons data for public viewing
  const publicPersons = personsResult.persons.map(person => ({
    ...person,
    // Redact sensitive information for public viewing
    birthDate: person.privacy?.birthDate === 'public' ? person.birthDate : null,
    deathDate: person.privacy?.deathDate === 'public' ? person.deathDate : null,
    notes: person.privacy?.notes === 'public' ? person.notes : null,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <TreePine className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">FamilyLink</span>
            </Link>
            <div className="text-sm text-gray-500">
              Public Family Tree
            </div>
          </div>
        </div>
      </header>

      {/* Family Info */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{family.name}</CardTitle>
            {family.description && (
              <CardDescription>{family.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{publicPersons.length} family members</span>
              <span>•</span>
              <span>Public view</span>
            </div>
          </CardContent>
        </Card>

        {/* Tree Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Family Tree</CardTitle>
            <CardDescription>
              Interactive family tree view. Click and drag to explore, scroll to zoom.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] w-full">
              <TreeCanvas 
                persons={publicPersons}
              />
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="py-8">
              <h3 className="text-lg font-semibold mb-2">Want to contribute?</h3>
              <p className="text-gray-600 mb-4">
                Join this family tree to add memories, photos, and help build the family history.
              </p>
              <Link href="/auth/signin">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Sign In to Join
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
