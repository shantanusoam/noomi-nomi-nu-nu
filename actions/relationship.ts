'use server'

import { prisma } from '@/lib/prisma'
import { requireFamilyAccess } from '@/lib/auth'
import { createParentChildSchema, createSpouseSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createParentChild(parentId: string, childId: string) {
  try {
    // Get both persons to validate they're in the same family
    const [parent, child] = await Promise.all([
      prisma.person.findUnique({ where: { id: parentId }, select: { familyId: true, birthDate: true } }),
      prisma.person.findUnique({ where: { id: childId }, select: { familyId: true, birthDate: true } }),
    ])

    if (!parent || !child) {
      throw new Error('Person not found')
    }

    if (parent.familyId !== child.familyId) {
      throw new Error('Persons must be in the same family')
    }

    await requireFamilyAccess(parent.familyId, Role.EDITOR)

    // Validate no cycles
    if (await wouldCreateCycle(parentId, childId)) {
      throw new Error('Cannot create relationship: would create a cycle')
    }

    // Validate age sanity (parent should be older than child)
    if (parent.birthDate && child.birthDate && parent.birthDate >= child.birthDate) {
      throw new Error('Parent must be older than child')
    }

    const relationship = await prisma.relationship.create({
      data: {
        parentId,
        childId,
      },
    })

    revalidatePath(`/app/${parent.familyId}`)
    return { success: true, relationship }
  } catch (error) {
    console.error('Error creating parent-child relationship:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create relationship' }
  }
}

export async function deleteParentChild(parentId: string, childId: string) {
  try {
    const relationship = await prisma.relationship.findFirst({
      where: {
        parentId,
        childId,
      },
      include: {
        parent: { select: { familyId: true } },
      },
    })

    if (!relationship) {
      throw new Error('Relationship not found')
    }

    await requireFamilyAccess(relationship.parent.familyId, Role.EDITOR)

    await prisma.relationship.delete({
      where: {
        id: relationship.id,
      },
    })

    revalidatePath(`/app/${relationship.parent.familyId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting parent-child relationship:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete relationship' }
  }
}

export async function createSpouseLink(aId: string, bId: string, startDate?: Date, endDate?: Date) {
  try {
    // Get both persons to validate they're in the same family
    const [personA, personB] = await Promise.all([
      prisma.person.findUnique({ where: { id: aId }, select: { familyId: true } }),
      prisma.person.findUnique({ where: { id: bId }, select: { familyId: true } }),
    ])

    if (!personA || !personB) {
      throw new Error('Person not found')
    }

    if (personA.familyId !== personB.familyId) {
      throw new Error('Persons must be in the same family')
    }

    await requireFamilyAccess(personA.familyId, Role.EDITOR)

    // Check if relationship already exists
    const existingSpouse = await prisma.spouse.findFirst({
      where: {
        OR: [
          { aId, bId },
          { aId: bId, bId: aId },
        ],
      },
    })

    if (existingSpouse) {
      throw new Error('Spouse relationship already exists')
    }

    const spouse = await prisma.spouse.create({
      data: {
        aId,
        bId,
        startDate,
        endDate,
      },
    })

    revalidatePath(`/app/${personA.familyId}`)
    return { success: true, spouse }
  } catch (error) {
    console.error('Error creating spouse relationship:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create spouse relationship' }
  }
}

export async function endSpouseLink(spouseId: string, endDate?: Date) {
  try {
    const spouse = await prisma.spouse.findUnique({
      where: { id: spouseId },
      include: {
        a: { select: { familyId: true } },
      },
    })

    if (!spouse) {
      throw new Error('Spouse relationship not found')
    }

    await requireFamilyAccess(spouse.a.familyId, Role.EDITOR)

    const updatedSpouse = await prisma.spouse.update({
      where: { id: spouseId },
      data: {
        endDate: endDate || new Date(),
      },
    })

    revalidatePath(`/app/${spouse.a.familyId}`)
    return { success: true, spouse: updatedSpouse }
  } catch (error) {
    console.error('Error ending spouse relationship:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to end spouse relationship' }
  }
}

export async function getSiblings(personId: string) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        parentLinks: {
          include: {
            parent: {
              include: {
                childLinks: {
                  include: {
                    child: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!person) {
      throw new Error('Person not found')
    }

    // Get all children of the person's parents (excluding the person themselves)
    const siblingIds = new Set<string>()
    
    for (const parentLink of person.parentLinks) {
      for (const childLink of parentLink.parent.childLinks) {
        if (childLink.childId !== personId) {
          siblingIds.add(childLink.childId)
        }
      }
    }

    const siblings = await prisma.person.findMany({
      where: {
        id: { in: Array.from(siblingIds) },
      },
    })

    return { success: true, siblings }
  } catch (error) {
    console.error('Error getting siblings:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get siblings' }
  }
}

// Helper function to check for cycles
async function wouldCreateCycle(parentId: string, childId: string): Promise<boolean> {
  // If child is already a parent of the parent, it would create a cycle
  const existingRelationship = await prisma.relationship.findFirst({
    where: {
      parentId: childId,
      childId: parentId,
    },
  })

  return !!existingRelationship
}
