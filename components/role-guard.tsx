import { Role } from '@prisma/client'
import { ReactNode } from 'react'
import { getRoleDisplayName } from '@/lib/permissions'

interface RoleGuardProps {
  userRole: Role
  requiredRole: Role
  children: ReactNode
  fallback?: ReactNode
}

const roleHierarchy = {
  [Role.VIEWER]: 0,
  [Role.EDITOR]: 1,
  [Role.OWNER]: 2,
}

export function RoleGuard({ userRole, requiredRole, children, fallback }: RoleGuardProps) {
  const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole]

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

interface PermissionMessageProps {
  requiredRole: Role
  userRole: Role
}

export function PermissionMessage({ requiredRole, userRole }: PermissionMessageProps) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-sm">
        This action requires {getRoleDisplayName(requiredRole)} permissions.
      </p>
      <p className="text-xs mt-1">
        Your current role: {getRoleDisplayName(userRole)}
      </p>
    </div>
  )
}
