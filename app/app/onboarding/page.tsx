'use client'

import { createFamily } from '@/actions/family'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TreePine, Plus, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleJoinFamily = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInviteError(null)
    setIsJoining(true)

    const formData = new FormData(e.currentTarget)
    const inviteLink = formData.get('inviteLink') as string

    if (!inviteLink || inviteLink.trim() === '') {
      setInviteError('Please enter an invite link')
      setIsJoining(false)
      return
    }

    // Extract token from invite URL
    // Support formats:
    // - https://familylink.com/invite/TOKEN
    // - http://localhost:3000/invite/TOKEN
    // - /invite/TOKEN
    // - TOKEN (just the token itself)
    let token: string | null = null

    try {
      // Try to parse as URL first
      if (inviteLink.includes('/')) {
        const url = new URL(inviteLink.startsWith('http') ? inviteLink : `https://${inviteLink}`)
        const pathParts = url.pathname.split('/')
        const inviteIndex = pathParts.indexOf('invite')
        if (inviteIndex !== -1 && pathParts[inviteIndex + 1]) {
          token = pathParts[inviteIndex + 1]
        }
      } else {
        // Just the token
        token = inviteLink.trim()
      }

      if (!token || token.length < 10) {
        setInviteError('Invalid invite link format. Please check your invite link and try again.')
        setIsJoining(false)
        return
      }

      // Redirect to invite acceptance page
      router.push(`/invite/${token}`)
    } catch (error) {
      setInviteError('Invalid invite link format. Please check your invite link and try again.')
      setIsJoining(false)
    }
  }

  const handleCreateFamily = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(false)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await createFamily(formData)
      
      if (result.success && result.family) {
        setCreateSuccess(true)
        // Redirect to the new family after a short delay
        setTimeout(() => {
          router.push(`/app/${result.family.slug}`)
        }, 1000)
      } else {
        setCreateError(result.error || 'Failed to create family. Please try again.')
      }
    })
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TreePine className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">FamilyLink</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FamilyLink!</h1>
          <p className="text-gray-600">Let's get your family tree started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Family */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <CardTitle>Create New Family</CardTitle>
              </div>
              <CardDescription>
                Start a new family tree and invite your relatives to join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFamily}>
                <div className="space-y-4">
                  {createError && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{createError}</span>
                    </div>
                  )}

                  {createSuccess && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Family created successfully! Redirecting...</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Family Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., The Smith Family"
                      required
                      disabled={isPending || createSuccess}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Family URL</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">familylink.com/share/</span>
                      <Input
                        id="slug"
                        name="slug"
                        placeholder="smith-family"
                        required
                        disabled={isPending || createSuccess}
                        pattern="[a-z0-9-]+"
                        title="Only lowercase letters, numbers, and hyphens allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This will be your family's public URL (lowercase letters, numbers, and hyphens only)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Tell us about your family..."
                      disabled={isPending || createSuccess}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isPending || createSuccess}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : createSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Created!
                      </>
                    ) : (
                      'Create Family Tree'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Join Existing Family */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle>Join Existing Family</CardTitle>
              </div>
              <CardDescription>
                Have an invite link? Join an existing family tree.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinFamily}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteLink">Invite Link</Label>
                    <Input
                      id="inviteLink"
                      name="inviteLink"
                      placeholder="https://familylink.com/invite/... or paste invite token"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Paste the full invite link or just the invite token
                    </p>
                  </div>

                  {inviteError && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{inviteError}</span>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="w-full"
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Join Family'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Or</p>
                    <Link href="/share/the-demo-family">
                      <Button variant="ghost" className="w-full">
                        View Demo Family
                      </Button>
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
