import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { joinFamilyByInvite } from '@/actions/family'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TreePine, CheckCircle, XCircle, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth-config'

interface InvitePageProps {
  params: {
    token: string
  }
  searchParams: {
    email?: string
  }
}

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { token } = await params
  const user = await getCurrentUser()

  // Validate invite token
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { family: true },
  })

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button variant="outline">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if invite has expired
  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Invite Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please request a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button variant="outline">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user is authenticated, check if they're already a member
  if (user) {
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId: invite.familyId,
        },
      },
    })

    if (existingMembership) {
      // Already a member, redirect to family
      redirect(`/app/${invite.family.slug}`)
    }

    // Check if email matches invite email
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle>Email Mismatch</CardTitle>
              <CardDescription>
                This invitation was sent to {invite.email}, but you're signed in as {user.email}.
                Please sign in with the correct email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <form action={async () => {
                'use server'
                await signIn('email', {
                  email: invite.email,
                  redirectTo: `/invite/${token}`,
                })
              }}>
                <Button type="submit" className="w-full">
                  Sign In with {invite.email}
                </Button>
              </form>
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Sign In with Different Email
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    // User is authenticated and email matches, join immediately
    const result = await joinFamilyByInvite(token)
    
    if (result.success) {
      redirect(`/app/${invite.family.slug}`)
    } else {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Error Joining Family</CardTitle>
              <CardDescription>
                {result.error || 'Failed to join family. Please try again.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/app">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // User is not authenticated - prompt them to sign in/sign up
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <TreePine className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">FamilyLink</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>You've Been Invited!</CardTitle>
            <CardDescription>
              You've been invited to join <strong>{invite.family.name}</strong> as a {invite.role.toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Invited email:</strong> {invite.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Role:</strong> {invite.role}
              </p>
            </div>

            <form action={async () => {
              'use server'
              await signIn('email', {
                email: invite.email,
                redirectTo: `/invite/${token}`,
              })
            }}>
              <Button type="submit" className="w-full">
                Sign In / Sign Up to Accept
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Sign In with Different Email
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}




