import { createFamily } from '@/actions/family'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TreePine, Plus, Users } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
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
              <form action={createFamily}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Family Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., The Smith Family"
                      required
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
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This will be your family's public URL
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Tell us about your family..."
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Family Tree
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteLink">Invite Link</Label>
                  <Input
                    id="inviteLink"
                    placeholder="https://familylink.com/invite/..."
                  />
                </div>
                
                <Button variant="outline" className="w-full" disabled>
                  Join Family (Coming Soon)
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
