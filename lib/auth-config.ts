import NextAuth from 'next-auth'
import Email from 'next-auth/providers/email'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Determine which providers to use based on environment
const useEmailAuth = process.env.USE_EMAIL_AUTH === 'true'

const providers = useEmailAuth
  ? [
      Email({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          secure: false,
          auth: false,
        },
        from: process.env.EMAIL_FROM,
      }),
    ]
  : [
      Credentials({
        name: 'Development',
        credentials: {
          email: { label: 'Email', type: 'email' },
        },
        async authorize(credentials) {
          if (!credentials?.email) return null
          
          // For development, create or find user by email
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })
          
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: (credentials.email as string).split('@')[0],
              },
            })
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        },
      }),
    ]

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: useEmailAuth ? PrismaAdapter(prisma) : undefined,
  providers,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // For email auth, user is available; for credentials, use token
        session.user.id = user?.id || token?.sub || ''
        // Ensure email is set (should always be present, but be defensive)
        if (!session.user.email && user?.email) {
          session.user.email = user.email
        }
        if (!session.user.email && token?.email) {
          session.user.email = token.email as string
        }
      }
      return session
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.sub = user.id
        if (user.email) {
          token.email = user.email
        }
      }
      // For credentials provider, email might be in account
      if (account && account.type === 'credentials' && !token.email) {
        // Try to get email from account metadata if available
        if (account.providerAccountId) {
          token.email = account.providerAccountId
        }
      }
      return token
    },
  },
  session: {
    strategy: useEmailAuth ? 'database' : 'jwt',
  },
  trustHost: true, // Allow localhost for development
})
