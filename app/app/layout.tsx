import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth-config'
import { getUserFamilies, getCurrentUser } from '@/lib/auth'
import { AppSidebar } from '@/components/app-sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth()
  
  if (!session?.user) {
    // No session - redirect to sign in with callback
    redirect('/auth/signin?callbackUrl=/app')
  }

  // Get the current user to ensure we have the full user object
  const user = await getCurrentUser()
  
  if (!user) {
    // Session exists but user not found - this shouldn't happen
    console.error('[AppLayout] Session exists but user not found', {
      sessionUserId: session.user?.id,
      sessionEmail: session.user?.email,
      hasSession: !!session,
      hasUser: !!session.user,
    })
    redirect('/auth/signin?callbackUrl=/app')
  }

  const memberships = await getUserFamilies(user.id)
  
  // Transform the data structure to match what components expect
  const families = memberships.map(membership => ({
    family: membership.family,
    membership: {
      id: membership.id,
      role: membership.role,
      userId: membership.userId,
      familyId: membership.familyId,
      createdAt: membership.createdAt,
    },
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <AppSidebar families={families} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
