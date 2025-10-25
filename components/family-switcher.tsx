import { Family, Membership } from '@prisma/client'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FamilySwitcherProps {
  families: Array<{
    family: Family
    membership: Membership
  }>
  currentFamily?: Family
  onFamilySelect: (family: Family) => void
}

export function FamilySwitcher({ families, currentFamily, onFamilySelect }: FamilySwitcherProps) {
  if (families.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 text-center">
            No families found. Create or join a family to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Switch Family</h3>
      <div className="space-y-1">
        {families.map(({ family, membership }) => (
          <Button
            key={family.id}
            variant={currentFamily?.id === family.id ? 'default' : 'ghost'}
            className="w-full justify-start text-left h-auto p-3"
            onClick={() => onFamilySelect(family)}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{family.name}</span>
              <span className="text-xs text-gray-500">
                {membership.role} • {family._count?.persons || 0} members
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
