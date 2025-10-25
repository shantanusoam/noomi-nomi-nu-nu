import { getFamilyBySlug } from '@/actions/family'
import { getPersons } from '@/actions/person'
import { PersonCard } from '@/components/person-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'

interface FamilyPeoplePageProps {
  params: {
    familySlug: string
  }
}

export default async function FamilyPeoplePage({ params }: FamilyPeoplePageProps) {
  const { familySlug } = params

  // Get family data
  const familyResult = await getFamilyBySlug(familySlug)
  if (!familyResult.success || !familyResult.family) {
    notFound()
  }

  const family = familyResult.family

  // Get persons data
  const personsResult = await getPersons(family.id)
  if (!personsResult.success || !personsResult.persons) {
    notFound()
  }

  const persons = personsResult.persons

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
            <p className="text-gray-600">Family Members</p>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search family members..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {persons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No family members yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your family tree by adding family members.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {persons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => {
                  // Handle person click - could open edit modal
                  console.log('Person clicked:', person.givenName)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
