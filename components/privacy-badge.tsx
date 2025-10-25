import { Badge } from '@/components/ui/badge'
import { PrivacyLevel } from '@/lib/validations'

interface PrivacyBadgeProps {
  level: PrivacyLevel
  className?: string
}

const privacyConfig = {
  public: {
    label: 'Public',
    variant: 'default' as const,
    description: 'Visible to everyone',
  },
  family: {
    label: 'Family',
    variant: 'secondary' as const,
    description: 'Visible to family members only',
  },
  private: {
    label: 'Private',
    variant: 'outline' as const,
    description: 'Visible only to you',
  },
}

export function PrivacyBadge({ level, className }: PrivacyBadgeProps) {
  const config = privacyConfig[level]

  return (
    <Badge variant={config.variant} className={className} title={config.description}>
      {config.label}
    </Badge>
  )
}
