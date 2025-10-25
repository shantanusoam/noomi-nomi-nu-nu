import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TreePine, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent you a magic link to sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Magic link sent successfully</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Click the link in your email to complete the sign-in process. 
                The link will expire in 24 hours.
              </p>

              <div className="pt-4">
                <Link href="/auth/signin">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Didn't receive the email? Try again
                  </button>
                </Link>
              </div>
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
