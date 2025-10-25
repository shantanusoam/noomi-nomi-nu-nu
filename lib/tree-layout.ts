import { Person, Relationship, Spouse } from '@prisma/client'

export interface TreeNode {
  id: string
  type: 'person' | 'spouse-connector'
  data: {
    person?: Person
    spouse?: { a: Person; b: Person }
  }
  position: { x: number; y: number }
}

export interface TreeEdge {
  id: string
  source: string
  target: string
  type: 'parent-child' | 'spouse'
  data?: any
}

export interface TreeLayout {
  nodes: TreeNode[]
  edges: TreeEdge[]
}

interface PersonWithRelations extends Person {
  parentLinks: Relationship[]
  childLinks: Relationship[]
  spouseLinks: Spouse[]
}

interface LayoutPerson extends Person {
  depth: number
  generation: number
  siblings: string[]
  spouses: string[]
  children: string[]
  parents: string[]
}

/**
 * Computes a hierarchical tree layout for family members
 * Uses BFS to determine generational depth and positions nodes accordingly
 */
export function computeTreeLayout(persons: PersonWithRelations[]): TreeLayout {
  if (persons.length === 0) {
    return { nodes: [], edges: [] }
  }

  // Build adjacency lists and compute depths
  const layoutPersons = buildLayoutPersons(persons)
  const nodes: TreeNode[] = []
  const edges: TreeEdge[] = []

  // Group persons by generation
  const generations = groupByGeneration(layoutPersons)

  // Position nodes by generation
  let nodeY = 0
  const generationHeight = 200
  const nodeSpacing = 150

  for (const [generation, generationPersons] of generations.entries()) {
    const nodeX = -(generationPersons.length - 1) * nodeSpacing / 2

    for (let i = 0; i < generationPersons.length; i++) {
      const person = generationPersons[i]
      
      // Add person node
      nodes.push({
        id: person.id,
        type: 'person',
        data: { person },
        position: { x: nodeX + i * nodeSpacing, y: nodeY },
      })

      // Add spouse connector nodes for married couples
      for (const spouseId of person.spouses) {
        const spouse = layoutPersons.find(p => p.id === spouseId)
        if (spouse && spouse.generation === person.generation) {
          const spouseNode = nodes.find(n => n.id === spouseId)
          if (spouseNode) {
            // Add spouse connector between the two nodes
            const connectorId = `spouse-${person.id}-${spouseId}`
            const connectorX = (person.position?.x || 0) + (spouseNode.position.x - (person.position?.x || 0)) / 2
            
            nodes.push({
              id: connectorId,
              type: 'spouse-connector',
              data: {
                spouse: {
                  a: person,
                  b: spouse,
                },
              },
              position: { x: connectorX, y: nodeY - 30 },
            })

            // Add spouse edges
            edges.push({
              id: `spouse-${person.id}-${spouseId}`,
              source: person.id,
              target: spouseId,
              type: 'spouse',
            })
          }
        }
      }
    }

    nodeY += generationHeight
  }

  // Add parent-child edges
  for (const person of layoutPersons) {
    for (const childId of person.children) {
      edges.push({
        id: `parent-child-${person.id}-${childId}`,
        source: person.id,
        target: childId,
        type: 'parent-child',
      })
    }
  }

  return { nodes, edges }
}

function buildLayoutPersons(persons: PersonWithRelations[]): LayoutPerson[] {
  const layoutPersons: LayoutPerson[] = persons.map(person => ({
    ...person,
    depth: 0,
    generation: 0,
    siblings: [],
    spouses: [],
    children: [],
    parents: [],
  }))

  // Build adjacency lists
  for (const person of layoutPersons) {
    // Parents
    person.parents = person.parentLinks.map(link => link.parentId)
    
    // Children
    person.children = person.childLinks.map(link => link.childId)
    
    // Spouses - combine both spouseLinksA and spouseLinksB
    const spouseLinksA = person.spouseLinksA || []
    const spouseLinksB = person.spouseLinksB || []
    const allSpouseLinks = [...spouseLinksA, ...spouseLinksB]
    person.spouses = allSpouseLinks.map(link => 
      link.aId === person.id ? link.bId : link.aId
    )
  }

  // Compute depths using BFS from roots (persons with no parents)
  const roots = layoutPersons.filter(p => p.parents.length === 0)
  const queue = [...roots.map(root => ({ person: root, depth: 0 }))]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { person, depth } = queue.shift()!
    
    if (visited.has(person.id)) continue
    visited.add(person.id)
    
    person.depth = depth
    person.generation = depth

    // Add children to queue
    for (const childId of person.children) {
      const child = layoutPersons.find(p => p.id === childId)
      if (child && !visited.has(childId)) {
        queue.push({ person: child, depth: depth + 1 })
      }
    }
  }

  // Compute siblings
  for (const person of layoutPersons) {
    const siblingIds = new Set<string>()
    
    for (const parentId of person.parents) {
      const parent = layoutPersons.find(p => p.id === parentId)
      if (parent) {
        for (const childId of parent.children) {
          if (childId !== person.id) {
            siblingIds.add(childId)
          }
        }
      }
    }
    
    person.siblings = Array.from(siblingIds)
  }

  return layoutPersons
}

function groupByGeneration(persons: LayoutPerson[]): Map<number, LayoutPerson[]> {
  const generations = new Map<number, LayoutPerson[]>()
  
  for (const person of persons) {
    if (!generations.has(person.generation)) {
      generations.set(person.generation, [])
    }
    generations.get(person.generation)!.push(person)
  }

  // Sort each generation by name for consistent ordering
  for (const [generation, persons] of generations) {
    persons.sort((a, b) => {
      const nameA = `${a.givenName} ${a.familyName || ''}`.trim()
      const nameB = `${b.givenName} ${b.familyName || ''}`.trim()
      return nameA.localeCompare(nameB)
    })
  }

  return generations
}

/**
 * Filters person data based on privacy settings
 */
export function filterPersonData(person: Person, viewerRole: 'public' | 'family' | 'private', isFamilyMember: boolean = false): Partial<Person> {
  const privacy = person.privacy as Record<string, 'public' | 'family' | 'private'> || {}
  
  const filtered: Partial<Person> = {
    id: person.id,
    familyId: person.familyId,
    givenName: person.givenName,
    middleName: person.middleName,
    familyName: person.familyName,
    gender: person.gender,
    avatarUrl: person.avatarUrl,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  }

  // Apply privacy filters
  if (viewerRole === 'public') {
    // Public viewers only see public fields
    if (privacy.birthDate === 'public') {
      filtered.birthDate = person.birthDate
    }
    if (privacy.deathDate === 'public') {
      filtered.deathDate = person.deathDate
    }
    if (privacy.notes === 'public') {
      filtered.notes = person.notes
    }
  } else if (isFamilyMember) {
    // Family members see family and public fields
    if (privacy.birthDate === 'public' || privacy.birthDate === 'family') {
      filtered.birthDate = person.birthDate
    }
    if (privacy.deathDate === 'public' || privacy.deathDate === 'family') {
      filtered.deathDate = person.deathDate
    }
    if (privacy.notes === 'public' || privacy.notes === 'family') {
      filtered.notes = person.notes
    }
  } else {
    // Private viewers see all fields
    filtered.birthDate = person.birthDate
    filtered.deathDate = person.deathDate
    filtered.notes = person.notes
  }

  return filtered
}

/**
 * Formats birth/death dates for display
 */
export function formatLifeYears(birthDate?: Date | null, deathDate?: Date | null): string {
  if (!birthDate) return 'Unknown'
  
  const birthYear = birthDate.getFullYear()
  const deathYear = deathDate?.getFullYear()
  
  if (deathYear) {
    return `${birthYear} - ${deathYear}`
  } else {
    const currentYear = new Date().getFullYear()
    return `${birthYear} - Present`
  }
}
