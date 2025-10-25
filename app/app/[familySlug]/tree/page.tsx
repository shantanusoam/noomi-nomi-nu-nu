import { getFamilyBySlug } from '@/actions/family'
import { getPersons } from '@/actions/person'
import { TreeCanvas } from '@/components/tree-canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Download, Maximize } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface FamilyTreePageProps {
  params: {
    familySlug: string
  }
}

export default async function FamilyTreePage({ params }: FamilyTreePageProps) {
  const { familySlug } = await params

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

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
            <p className="text-gray-600">Family Tree</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Maximize className="h-4 w-4 mr-2" />
              Fit View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </div>
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 bg-gray-50">
        <TreeCanvas 
          persons={personsResult.persons}
          onPersonClick={(person) => {
            // Handle person click - could open a side panel
            console.log('Person clicked:', person.givenName)
          }}
          className="h-full"
        />
      </div>

      {/* Info Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{personsResult.persons.length} family members</span>
            <span>•</span>
            <span>Click and drag to explore</span>
            <span>•</span>
            <span>Scroll to zoom</span>
          </div>
          <div>
            <Link href={`/share/${family.slug}`} className="text-blue-600 hover:text-blue-800">
              View public link
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
