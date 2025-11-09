import { TreePine, Home, Users, Heart, Settings, LogOut } from 'lucide-react'
import { Family, Membership } from '@prisma/client'
import { FamilySwitcher } from '@/components/family-switcher'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { signOut } from '@/lib/auth-config'

interface AppSidebarProps {
  families: Array<{
    family: Family & {
      _count?: {
        persons: number
        memories: number
      }
    }
    membership: Membership
  }>
}

export function AppSidebar({ families }: AppSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <TreePine className="h-6 w-6 text-green-600" />
          <span className="text-lg font-bold text-gray-900">FamilyLink</span>
        </Link>
      </div>

      {/* Family Switcher */}
      <div className="p-4 border-b border-gray-200">
        <FamilySwitcher 
          families={families}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/app">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        
        {families.length > 0 && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Family Tools
              </h3>
              
              <Link href={`/app/${families[0]?.family.slug}/tree`}>
                <Button variant="ghost" className="w-full justify-start">
                  <TreePine className="h-4 w-4 mr-2" />
                  Family Tree
                </Button>
              </Link>
              
              <Link href={`/app/${families[0]?.family.slug}/people`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  People
                </Button>
              </Link>
              
              <Link href={`/app/${families[0]?.family.slug}/feed`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Memories
                </Button>
              </Link>
              
              <Link href={`/app/${families[0]?.family.slug}/settings`}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <form action={async () => {
          'use server'
          await signOut({ redirectTo: '/' })
        }}>
          <Button variant="ghost" className="w-full justify-start" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
