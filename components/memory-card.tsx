import { Memory, User } from '@prisma/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface MemoryCardProps {
  memory: Memory & {
    author: Pick<User, 'id' | 'name' | 'email' | 'image'>
  }
  taggedPersons?: Array<{ id: string; givenName: string; familyName?: string }>
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
}

export function MemoryCard({ 
  memory, 
  taggedPersons = [], 
  onEdit, 
  onDelete, 
  canEdit = false 
}: MemoryCardProps) {
  const authorName = memory.author.name || memory.author.email
  const authorInitials = authorName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={memory.author.image || undefined} />
              <AvatarFallback className="text-xs">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{authorName}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex space-x-1">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <h3 className="font-semibold text-lg mb-2">{memory.title}</h3>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{memory.body}</p>
        </div>

        {memory.imageUrl && (
          <div className="mt-4">
            <img 
              src={memory.imageUrl} 
              alt={memory.title}
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        )}

        {taggedPersons.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500">Tagged:</span>
            {taggedPersons.map(person => (
              <Badge key={person.id} variant="outline" className="text-xs">
                {person.givenName} {person.familyName}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
