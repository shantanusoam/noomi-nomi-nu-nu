'use server'

import { prisma } from '@/lib/prisma'
import { requireFamilyAccess, requireAuth } from '@/lib/auth'
import { createInviteSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { sendInviteEmail } from '@/lib/emails'

export async function createInvite(familyId: string, formData: FormData) {
  try {
    const data = {
      familyId,
      email: formData.get('email') as string,
      role: formData.get('role') as Role,
    }

    const validatedData = createInviteSchema.parse(data)
    await requireFamilyAccess(familyId, Role.OWNER)

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_familyId: {
            userId: existingUser.id,
            familyId,
          },
        },
      })

      if (existingMembership) {
        throw new Error('User is already a member of this family')
      }
    }

    // Check for existing pending invite
    const existingInvite = await prisma.invite.findFirst({
      where: {
        familyId,
        email: validatedData.email,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvite) {
      throw new Error('Invite already sent to this email')
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    // Get family and inviter info for email
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { name: true },
    })

    const inviter = await requireAuth()

    const invite = await prisma.invite.create({
      data: {
        ...validatedData,
        token,
        expiresAt,
      },
    })

    // Send invite email (don't fail if email sending fails)
    const emailResult = await sendInviteEmail({
      inviteEmail: validatedData.email,
      familyName: family?.name || 'a family',
      inviteToken: token,
      role: validatedData.role,
      inviterName: inviter.name || undefined,
    })

    if (!emailResult.success) {
      console.error('Failed to send invite email:', emailResult.error)
      // Continue anyway - invite is created, user can still use the link
    }

    revalidatePath(`/app/${familyId}/settings`)
    return { 
      success: true, 
      invite,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    }
  } catch (error) {
    console.error('Error creating invite:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create invite' }
  }
}

export async function revokeInvite(inviteId: string) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      select: { familyId: true },
    })

    if (!invite) {
      throw new Error('Invite not found')
    }

    await requireFamilyAccess(invite.familyId, Role.OWNER)

    await prisma.invite.delete({
      where: { id: inviteId },
    })

    revalidatePath(`/app/${invite.familyId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Error revoking invite:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to revoke invite' }
  }
}

export async function getInvites(familyId: string) {
  try {
    await requireFamilyAccess(familyId, Role.OWNER)

    const invites = await prisma.invite.findMany({
      where: { familyId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, invites }
  } catch (error) {
    console.error('Error getting invites:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get invites' }
  }
}

export async function updateMemberRole(membershipId: string, newRole: Role) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: { familyId: true },
    })

    if (!membership) {
      throw new Error('Membership not found')
    }

    await requireFamilyAccess(membership.familyId, Role.OWNER)

    const updatedMembership = await prisma.membership.update({
      where: { id: membershipId },
      data: { role: newRole },
      include: {
        user: true,
      },
    })

    revalidatePath(`/app/${membership.familyId}/settings`)
    return { success: true, membership: updatedMembership }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update member role' }
  }
}

export async function removeMember(membershipId: string) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: { familyId: true, role: true },
    })

    if (!membership) {
      throw new Error('Membership not found')
    }

    await requireFamilyAccess(membership.familyId, Role.OWNER)

    // Don't allow removing the last owner
    if (membership.role === Role.OWNER) {
      const ownerCount = await prisma.membership.count({
        where: {
          familyId: membership.familyId,
          role: Role.OWNER,
        },
      })

      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the family')
      }
    }

    await prisma.membership.delete({
      where: { id: membershipId },
    })

    revalidatePath(`/app/${membership.familyId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}
