import { auth } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.email) return null

  return await prisma.user.findUnique({
    where: { email: session.user.email },
  })
}

export async function getUserFamilyMembership(familyId: string, userId: string) {
  return await prisma.membership.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId,
      },
    },
    include: {
      family: true,
      user: true,
    },
  })
}

export async function getUserFamilies(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      family: true,
    },
    orderBy: {
      family: {
        createdAt: 'desc',
      },
    },
  })
  
  // Get counts for each family
  const familiesWithCounts = await Promise.all(
    memberships.map(async (membership) => {
      const [personCount, memoryCount] = await Promise.all([
        prisma.person.count({ where: { familyId: membership.familyId } }),
        prisma.memory.count({ where: { familyId: membership.familyId } }),
      ])
      
      return {
        ...membership,
        family: {
          ...membership.family,
          _count: {
            persons: personCount,
            memories: memoryCount,
          },
        },
      }
    })
  )
  
  return familiesWithCounts
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireFamilyAccess(familyId: string, requiredRole: Role = Role.VIEWER) {
  const user = await requireAuth()
  const membership = await getUserFamilyMembership(familyId, user.id)
  
  if (!membership) {
    throw new Error('Access denied: Not a member of this family')
  }

  const roleHierarchy = {
    [Role.VIEWER]: 0,
    [Role.EDITOR]: 1,
    [Role.OWNER]: 2,
  }

  if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
    throw new Error(`Access denied: Requires ${requiredRole} role or higher`)
  }

  return { user, membership }
}
