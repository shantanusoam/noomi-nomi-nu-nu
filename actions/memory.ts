'use server'

import { prisma } from '@/lib/prisma'
import { requireFamilyAccess, requireAuth } from '@/lib/auth'
import { createMemorySchema, updateMemorySchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createMemory(familyId: string, formData: FormData) {
  try {
    const data = {
      familyId,
      title: formData.get('title') as string,
      body: formData.get('body') as string,
      imageUrl: formData.get('imageUrl') as string,
      taggedPersonIds: JSON.parse(formData.get('taggedPersonIds') as string || '[]'),
    }

    const validatedData = createMemorySchema.parse(data)
    const { user } = await requireFamilyAccess(familyId, Role.EDITOR)

    const memory = await prisma.memory.create({
      data: {
        ...validatedData,
        authorId: user.id,
      },
    })

    revalidatePath(`/app/${familyId}/feed`)
    return { success: true, memory }
  } catch (error) {
    console.error('Error creating memory:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create memory' }
  }
}

export async function updateMemory(memoryId: string, formData: FormData) {
  try {
    const data = {
      id: memoryId,
      title: formData.get('title') as string,
      body: formData.get('body') as string,
      imageUrl: formData.get('imageUrl') as string,
      taggedPersonIds: JSON.parse(formData.get('taggedPersonIds') as string || '[]'),
    }

    const validatedData = updateMemorySchema.parse(data)
    
    // Get the memory to find the family
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { familyId: true },
    })

    if (!memory) {
      throw new Error('Memory not found')
    }

    await requireFamilyAccess(memory.familyId, Role.EDITOR)

    const updatedMemory = await prisma.memory.update({
      where: { id: memoryId },
      data: validatedData,
    })

    revalidatePath(`/app/${memory.familyId}/feed`)
    return { success: true, memory: updatedMemory }
  } catch (error) {
    console.error('Error updating memory:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update memory' }
  }
}

export async function deleteMemory(memoryId: string) {
  try {
    // Get the memory to find the family
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId },
      select: { familyId: true },
    })

    if (!memory) {
      throw new Error('Memory not found')
    }

    await requireFamilyAccess(memory.familyId, Role.EDITOR)

    await prisma.memory.delete({
      where: { id: memoryId },
    })

    revalidatePath(`/app/${memory.familyId}/feed`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting memory:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete memory' }
  }
}

export async function getMemories(familyId: string) {
  try {
    await requireFamilyAccess(familyId)

    const memories = await prisma.memory.findMany({
      where: { familyId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, memories }
  } catch (error) {
    console.error('Error getting memories:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get memories' }
  }
}

export async function getMemory(memoryId: string) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        family: true,
      },
    })

    if (!memory) {
      throw new Error('Memory not found')
    }

    await requireFamilyAccess(memory.familyId)

    return { success: true, memory }
  } catch (error) {
    console.error('Error getting memory:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get memory' }
  }
}
