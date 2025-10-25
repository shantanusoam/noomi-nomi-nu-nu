import { getFamilyBySlug } from '@/actions/family'
import { getInvites } from '@/actions/invite'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RoleGuard, PermissionMessage } from '@/components/role-guard'
import { createInvite } from '@/actions/invite'
import { Plus, Settings, Users, Mail, Copy, Trash2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Role } from '@prisma/client'

interface FamilySettingsPageProps {
  params: {
    familySlug: string
  }
}

export default async function FamilySettingsPage({ params }: FamilySettingsPageProps) {
  const { familySlug } = await params

  // Get family data
  const familyResult = await getFamilyBySlug(familySlug)
  if (!familyResult.success || !familyResult.family) {
    notFound()
  }

  const family = familyResult.family

  // Get invites data (only for owners)
  const invitesResult = await getInvites(family.id)
  const invites = invitesResult.success ? invitesResult.invites || [] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
            <p className="text-gray-600">Family Settings</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Family Info */}
          <Card>
            <CardHeader>
              <CardTitle>Family Information</CardTitle>
              <CardDescription>
                Update your family's basic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={async (formData: FormData) => {
                'use server'
                // Handle family update
                console.log('Update family:', formData.get('name'))
              }}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Family Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={family.name}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Family URL</Label>
                    <Input
                      id="slug"
                      name="slug"
                      defaultValue={family.slug}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={family.description || ''}
                    />
                  </div>
                  
                  <Button type="submit">Update Family</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                Manage family member roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {family.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{member.role}</Badge>
                      <RoleGuard userRole={member.role} requiredRole={Role.OWNER}>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </RoleGuard>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invite Members */}
          <RoleGuard userRole={Role.OWNER} requiredRole={Role.OWNER}>
            <Card>
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
                <CardDescription>
                  Send invitations to join your family tree
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createInvite}>
                  <input type="hidden" name="familyId" value={family.id} />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="family@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        name="role"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        defaultValue="VIEWER"
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                        <option value="OWNER">Owner</option>
                      </select>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Pending Invites */}
          <RoleGuard userRole={Role.OWNER} requiredRole={Role.OWNER}>
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Manage sent invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invites.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending invitations</p>
                ) : (
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-gray-500">{invite.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </RoleGuard>
        </div>
      </div>
    </div>
  )
}
