'use server'

import { prisma } from '@/lib/prisma'
import { requireFamilyAccess, requireAuth } from '@/lib/auth'
import { createPersonSchema, updatePersonSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createPerson(familyId: string, formData: FormData) {
  try {
    const data = {
      familyId,
      givenName: formData.get('givenName') as string,
      middleName: formData.get('middleName') as string,
      familyName: formData.get('familyName') as string,
      gender: formData.get('gender') as string,
      birthDate: formData.get('birthDate') ? new Date(formData.get('birthDate') as string) : undefined,
      deathDate: formData.get('deathDate') ? new Date(formData.get('deathDate') as string) : undefined,
      avatarUrl: formData.get('avatarUrl') as string,
      notes: formData.get('notes') as string,
    }

    const validatedData = createPersonSchema.parse(data)
    await requireFamilyAccess(familyId, Role.EDITOR)

    const person = await prisma.person.create({
      data: validatedData,
    })

    revalidatePath(`/app/${familyId}`)
    return { success: true, person }
  } catch (error) {
    console.error('Error creating person:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create person' }
  }
}

export async function updatePerson(personId: string, formData: FormData) {
  try {
    const data = {
      id: personId,
      givenName: formData.get('givenName') as string,
      middleName: formData.get('middleName') as string,
      familyName: formData.get('familyName') as string,
      gender: formData.get('gender') as string,
      birthDate: formData.get('birthDate') ? new Date(formData.get('birthDate') as string) : undefined,
      deathDate: formData.get('deathDate') ? new Date(formData.get('deathDate') as string) : undefined,
      avatarUrl: formData.get('avatarUrl') as string,
      notes: formData.get('notes') as string,
    }

    const validatedData = updatePersonSchema.parse(data)
    
    // Get the person to find the family
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { familyId: true },
    })

    if (!person) {
      throw new Error('Person not found')
    }

    await requireFamilyAccess(person.familyId, Role.EDITOR)

    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: validatedData,
    })

    revalidatePath(`/app/${person.familyId}`)
    return { success: true, person: updatedPerson }
  } catch (error) {
    console.error('Error updating person:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update person' }
  }
}

export async function deletePerson(personId: string) {
  try {
    // Get the person to find the family
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { familyId: true },
    })

    if (!person) {
      throw new Error('Person not found')
    }

    await requireFamilyAccess(person.familyId, Role.EDITOR)

    await prisma.person.delete({
      where: { id: personId },
    })

    revalidatePath(`/app/${person.familyId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting person:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete person' }
  }
}

export async function getPersons(familyId: string) {
  try {
    await requireFamilyAccess(familyId)

    const persons = await prisma.person.findMany({
      where: { familyId },
      include: {
        parentLinks: {
          include: {
            parent: true,
          },
        },
        childLinks: {
          include: {
            child: true,
          },
        },
        spouseLinks: {
          include: {
            a: true,
            b: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return { success: true, persons }
  } catch (error) {
    console.error('Error getting persons:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get persons' }
  }
}

export async function getPerson(personId: string) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        family: true,
        parentLinks: {
          include: {
            parent: true,
          },
        },
        childLinks: {
          include: {
            child: true,
          },
        },
        spouseLinks: {
          include: {
            a: true,
            b: true,
          },
        },
      },
    })

    if (!person) {
      throw new Error('Person not found')
    }

    await requireFamilyAccess(person.familyId)

    return { success: true, person }
  } catch (error) {
    console.error('Error getting person:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get person' }
  }
}

export async function searchPersons(familyId: string, query: string) {
  try {
    await requireFamilyAccess(familyId)

    const persons = await prisma.person.findMany({
      where: {
        familyId,
        OR: [
          { givenName: { contains: query, mode: 'insensitive' } },
          { middleName: { contains: query, mode: 'insensitive' } },
          { familyName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })

    return { success: true, persons }
  } catch (error) {
    console.error('Error searching persons:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to search persons' }
  }
}
