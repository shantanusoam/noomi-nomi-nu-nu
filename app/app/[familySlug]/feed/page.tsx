import { getFamilyBySlug } from '@/actions/family'
import { getMemories } from '@/actions/memory'
import { MemoryCard } from '@/components/memory-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Heart } from 'lucide-react'
import { notFound } from 'next/navigation'

interface FamilyFeedPageProps {
  params: {
    familySlug: string
  }
}

export default async function FamilyFeedPage({ params }: FamilyFeedPageProps) {
  const { familySlug } = params

  // Get family data
  const familyResult = await getFamilyBySlug(familySlug)
  if (!familyResult.success || !familyResult.family) {
    notFound()
  }

  const family = familyResult.family

  // Get memories data
  const memoriesResult = await getMemories(family.id)
  if (!memoriesResult.success) {
    notFound()
  }

  const memories = memoriesResult.memories || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
            <p className="text-gray-600">Family Memories & Updates</p>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {memories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No memories yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your family's story by adding memories, photos, and stories.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Memory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                canEdit={true} // This would be based on user permissions
                onEdit={() => {
                  // Handle edit
                  console.log('Edit memory:', memory.id)
                }}
                onDelete={() => {
                  // Handle delete
                  console.log('Delete memory:', memory.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
