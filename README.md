# FamilyLink - Collaborative Family Tree Platform

A modern, collaborative family tree application built with Next.js 14, TypeScript, and React Flow. FamilyLink allows families to build, share, and preserve their family history together.

## 🌟 Features

- **Interactive Family Tree**: Zoomable, pannable tree visualization with React Flow
- **Collaborative Building**: Multiple family members can contribute to the same tree
- **Role-Based Access Control**: Owner, Editor, and Viewer roles with appropriate permissions
- **Memory Sharing**: Add photos, stories, and memories to family members
- **Privacy Controls**: Field-level privacy settings (public, family, private)
- **Public Sharing**: Share read-only family trees with the world
- **Magic Link Authentication**: Secure, passwordless authentication
- **Real-time Updates**: Server actions for instant updates across the family

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Magic Link)
- **Visualization**: React Flow (@xyflow/react)
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Docker and Docker Compose (for local development)

## 🛠️ Local Development Setup (Docker)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd familylink
   ```

2. **Start Docker services**
   ```bash
   docker compose up -d
   ```
   This starts:
   - PostgreSQL 16 database (port 5432)
   - Mailhog email testing service (SMTP: 1025, Web UI: 8025)

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   The `.env.local` file is pre-configured for local Docker development:
   ```env
   # Database (PostgreSQL in Docker)
   DATABASE_URL="postgresql://familylink:familylink@localhost:5432/familylink?schema=public"
   
   # NextAuth.js
   NEXTAUTH_SECRET="dev-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Email Configuration (Mailhog for local testing)
   EMAIL_SERVER_HOST="localhost"
   EMAIL_SERVER_PORT="1025"
   EMAIL_SERVER_USER=""
   EMAIL_SERVER_PASSWORD=""
   EMAIL_FROM="noreply@familylink.local"
   
   # Authentication Mode Toggle
   USE_EMAIL_AUTH="false"  # Set to "true" to use email auth with Mailhog
   ```

5. **Initialize the database**
   ```bash
   # Push the schema to your database
   pnpm db:push
   
   # Seed with demo data
   pnpm db:seed
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Authentication Modes

FamilyLink supports two authentication modes for local development:

#### Development Mode (Default)
- Set `USE_EMAIL_AUTH="false"` in `.env.local`
- Simple email-based authentication (no email verification required)
- Enter any email address to sign in
- Perfect for rapid development and testing

#### Email Testing Mode
- Set `USE_EMAIL_AUTH="true"` in `.env.local`
- Uses Mailhog for email testing
- Access Mailhog UI at [http://localhost:8025](http://localhost:8025)
- All emails are captured locally for testing

### Docker Services

#### PostgreSQL Database
- **Host**: localhost
- **Port**: 5432
- **Database**: familylink
- **Username**: familylink
- **Password**: familylink
- **Persistent Volume**: `postgres_data`

#### Mailhog Email Testing
- **SMTP Server**: localhost:1025
- **Web UI**: [http://localhost:8025](http://localhost:8025)
- **Purpose**: Captures all outgoing emails for testing

### Useful Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Remove all data (reset database)
docker compose down -v
```

## 🗄️ Alternative Database Setup

If you prefer not to use Docker, you can set up PostgreSQL manually:

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `familylink`
3. Update `DATABASE_URL` in `.env.local`

### Option 2: Neon (Cloud)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Option 3: Vercel Postgres
1. Deploy to Vercel
2. Add Vercel Postgres addon
3. Use the provided connection string

## 📊 Demo Data

The seed script creates:
- **Demo Family**: "The Demo Family" (slug: `the-demo-family`)
- **10 Family Members**: Across 3 generations
- **Relationships**: Parent-child and spouse relationships
- **Memories**: Sample family stories and photos
- **Demo User**: `demo@familylink.com`

## 🔐 Authentication

FamilyLink uses magic link authentication for a seamless, passwordless experience:

1. Enter your email address
2. Check your email for the magic link
3. Click the link to sign in
4. No passwords to remember!

## 👥 User Roles

- **Owner**: Can manage family settings, invite members, edit all content
- **Editor**: Can add and edit people, relationships, and memories  
- **Viewer**: Can view family tree and memories (read-only)

## 🌐 Public Sharing

Every family tree has a public share link:
- Format: `/share/[family-slug]`
- Read-only access for non-members
- Privacy-filtered information (respects field-level privacy settings)
- Example: `/share/the-demo-family`

## 📁 Project Structure

```
familylink/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── app/               # Authenticated app shell
│   ├── share/             # Public share pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── person-card.tsx   # Person display component
│   ├── tree-canvas.tsx   # React Flow tree visualization
│   └── ...
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication helpers
│   ├── prisma.ts        # Database client
│   ├── tree-layout.ts   # Tree layout algorithm
│   └── validations.ts   # Zod schemas
├── actions/             # Server actions
│   ├── family.ts        # Family CRUD operations
│   ├── person.ts        # Person CRUD operations
│   ├── relationship.ts  # Relationship management
│   └── ...
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Demo data seed script
└── middleware.ts       # NextAuth middleware
```

## 🎨 UI Components

Built with shadcn/ui components:
- Button, Input, Card, Dialog, Sheet
- Avatar, Badge, Tabs, Separator
- Custom components for family tree visualization

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Push schema changes to database
pnpm db:seed          # Seed database with demo data
pnpm db:studio        # Open Prisma Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript compiler
pnpm format           # Format code with Prettier
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app is built with standard Next.js patterns and should work on any platform that supports Next.js 14.

## 🔒 Privacy & Security

- **Field-level privacy**: Control visibility of birth dates, notes, etc.
- **Role-based permissions**: Granular access control
- **Magic link auth**: No passwords stored
- **Public sharing**: Redacted information for non-members
- **Data validation**: Zod schemas for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Demo**: Visit `/share/the-demo-family` to see the app in action

## 🎯 Roadmap

- [ ] CSV import/export for family data
- [ ] Image upload for avatars and memories
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Family timeline view
- [ ] Integration with genealogy services
- [ ] Multi-language support

---

Built with ❤️ for families everywhere.
