import { z } from 'zod'
import { Role } from '@prisma/client'

// Person schemas
export const createPersonSchema = z.object({
  familyId: z.string().cuid(),
  givenName: z.string().min(1, 'Given name is required').max(50),
  middleName: z.string().max(50).optional(),
  familyName: z.string().max(50).optional(),
  gender: z.string().max(20).optional(),
  birthDate: z.date().optional(),
  deathDate: z.date().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  privacy: z.object({
    birthDate: z.enum(['public', 'family', 'private']),
    deathDate: z.enum(['public', 'family', 'private']),
    notes: z.enum(['public', 'family', 'private']),
  }).optional(),
})

export const updatePersonSchema = createPersonSchema.partial().extend({
  id: z.string().cuid(),
})

// Family schemas
export const createFamilySchema = z.object({
  name: z.string().min(1, 'Family name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
})

export const updateFamilySchema = createFamilySchema.partial().extend({
  id: z.string().cuid(),
})

// Relationship schemas
export const createParentChildSchema = z.object({
  parentId: z.string().cuid(),
  childId: z.string().cuid(),
})

export const createSpouseSchema = z.object({
  aId: z.string().cuid(),
  bId: z.string().cuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

// Memory schemas
export const createMemorySchema = z.object({
  familyId: z.string().cuid(),
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Content is required').max(2000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  taggedPersonIds: z.array(z.string().cuid()),
})

export const updateMemorySchema = createMemorySchema.partial().extend({
  id: z.string().cuid(),
})

// Invite schemas
export const createInviteSchema = z.object({
  familyId: z.string().cuid(),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role).default(Role.VIEWER),
})

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Search schemas
export const searchPersonsSchema = z.object({
  familyId: z.string().cuid(),
  query: z.string().min(1, 'Search query is required'),
})

// Privacy levels
export type PrivacyLevel = 'public' | 'family' | 'private'

export const PRIVACY_LEVELS: { value: PrivacyLevel; label: string; description: string }[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to everyone, including public share links',
  },
  {
    value: 'family',
    label: 'Family Only',
    description: 'Visible only to family members',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Visible only to you',
  },
]
