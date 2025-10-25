import { memo, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Person } from '@prisma/client'
import { PersonCard } from '@/components/person-card'

interface PersonNodeData {
  person: Person
  onPersonClick?: (person: Person) => void
}

export const PersonNode = memo(({ data, selected }: NodeProps<PersonNodeData>) => {
  const { person, onPersonClick } = data

  const handleClick = useCallback(() => {
    onPersonClick?.(person)
  }, [person, onPersonClick])

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} />
      <PersonCard 
        person={person} 
        onClick={handleClick}
        className={selected ? 'ring-2 ring-blue-500' : ''}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

PersonNode.displayName = 'PersonNode'

interface SpouseConnectorData {
  spouse: {
    a: Person
    b: Person
  }
}

export const SpouseConnector = memo(({ data }: NodeProps<SpouseConnectorData>) => {
  const { spouse } = data

  return (
    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full border-2 border-gray-300">
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    </div>
  )
})

SpouseConnector.displayName = 'SpouseConnector'

// Node types for React Flow
export const nodeTypes = {
  person: PersonNode,
  'spouse-connector': SpouseConnector,
}
