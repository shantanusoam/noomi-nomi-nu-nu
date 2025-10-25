import { Person } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatLifeYears } from '@/lib/tree-layout'

interface PersonCardProps {
  person: Person
  onClick?: () => void
  className?: string
}

export function PersonCard({ person, onClick, className }: PersonCardProps) {
  const fullName = [person.givenName, person.middleName, person.familyName]
    .filter(Boolean)
    .join(' ')

  const initials = [person.givenName, person.familyName]
    .filter(Boolean)
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <div
      className={`flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer min-w-[120px] ${className}`}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12 mb-2">
        <AvatarImage src={person.avatarUrl || undefined} alt={fullName} />
        <AvatarFallback className="text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <h3 className="font-medium text-sm text-gray-900 truncate max-w-[100px]">
          {person.givenName}
        </h3>
        {person.familyName && (
          <p className="text-xs text-gray-600 truncate max-w-[100px]">
            {person.familyName}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formatLifeYears(person.birthDate, person.deathDate)}
        </p>
      </div>

      {person.gender && (
        <Badge variant="outline" className="mt-2 text-xs">
          {person.gender}
        </Badge>
      )}
    </div>
  )
}
