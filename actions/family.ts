'use server'

import { prisma } from '@/lib/prisma'
import { requireFamilyAccess, getUserFamilies, requireAuth } from '@/lib/auth'
import { createFamilySchema, updateFamilySchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createFamily(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
    }

    const validatedData = createFamilySchema.parse(data)
    const user = await requireAuth()

    // Check if slug is already taken
    const existingFamily = await prisma.family.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingFamily) {
      throw new Error('Family slug already exists')
    }

    const family = await prisma.family.create({
      data: {
        ...validatedData,
        members: {
          create: {
            userId: user.id,
            role: Role.OWNER,
          },
        },
      },
    })

    revalidatePath('/app')
    return { success: true, family }
  } catch (error) {
    console.error('Error creating family:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create family' }
  }
}

export async function updateFamily(familyId: string, formData: FormData) {
  try {
    const data = {
      id: familyId,
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
    }

    const validatedData = updateFamilySchema.parse(data)
    await requireFamilyAccess(familyId, Role.OWNER)

    // Check if slug is already taken by another family
    if (validatedData.slug) {
      const existingFamily = await prisma.family.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: familyId },
        },
      })

      if (existingFamily) {
        throw new Error('Family slug already exists')
      }
    }

    const family = await prisma.family.update({
      where: { id: familyId },
      data: validatedData,
    })

    revalidatePath(`/app/${family.slug}`)
    return { success: true, family }
  } catch (error) {
    console.error('Error updating family:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update family' }
  }
}

export async function getFamily(familyId: string) {
  try {
    await requireFamilyAccess(familyId)

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            persons: true,
            memories: true,
          },
        },
      },
    })

    return { success: true, family }
  } catch (error) {
    console.error('Error getting family:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get family' }
  }
}

export async function getFamilyBySlug(slug: string) {
  try {
    const family = await prisma.family.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            persons: true,
            memories: true,
          },
        },
      },
    })

    if (!family) {
      throw new Error('Family not found')
    }

    return { success: true, family }
  } catch (error) {
    console.error('Error getting family by slug:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get family' }
  }
}

export async function joinFamilyByInvite(token: string) {
  try {
    const user = await requireAuth()

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { family: true },
    })

    if (!invite) {
      throw new Error('Invalid invite token')
    }

    if (invite.expiresAt < new Date()) {
      throw new Error('Invite has expired')
    }

    // Verify that the user's email matches the invite email
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error('This invitation was sent to a different email address')
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId: invite.familyId,
        },
      },
    })

    if (existingMembership) {
      throw new Error('You are already a member of this family')
    }

    // Create membership
    await prisma.membership.create({
      data: {
        userId: user.id,
        familyId: invite.familyId,
        role: invite.role,
      },
    })

    // Delete the invite
    await prisma.invite.delete({
      where: { id: invite.id },
    })

    revalidatePath('/app')
    return { success: true, family: invite.family }
  } catch (error) {
    console.error('Error joining family:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to join family' }
  }
}
