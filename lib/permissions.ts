import { Role } from '@prisma/client'

export function isViewer(role: Role): boolean {
  return role === Role.VIEWER
}

export function isEditor(role: Role): boolean {
  return role === Role.EDITOR || role === Role.OWNER
}

export function isOwner(role: Role): boolean {
  return role === Role.OWNER
}

export function canEdit(role: Role): boolean {
  return isEditor(role)
}

export function canManageRoles(role: Role): boolean {
  return isOwner(role)
}

export function canDelete(role: Role): boolean {
  return isEditor(role)
}

export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case Role.OWNER:
      return 'Owner'
    case Role.EDITOR:
      return 'Editor'
    case Role.VIEWER:
      return 'Viewer'
    default:
      return 'Unknown'
  }
}

export function getRoleDescription(role: Role): string {
  switch (role) {
    case Role.OWNER:
      return 'Can manage family settings, invite members, and edit all content'
    case Role.EDITOR:
      return 'Can add and edit people, relationships, and memories'
    case Role.VIEWER:
      return 'Can view family tree and memories'
    default:
      return 'Unknown role'
  }
}
