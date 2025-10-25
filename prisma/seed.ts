import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo family
  const family = await prisma.family.upsert({
    where: { slug: 'the-demo-family' },
    update: {},
    create: {
      name: 'The Demo Family',
      slug: 'the-demo-family',
      description: 'A sample family tree to demonstrate FamilyLink features',
    },
  })

  console.log('✅ Created family:', family.name)

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@familylink.com' },
    update: {},
    create: {
      email: 'demo@familylink.com',
      name: 'Demo User',
      emailVerified: new Date(),
    },
  })

  // Add user as owner of the family
  await prisma.membership.upsert({
    where: {
      userId_familyId: {
        userId: user.id,
        familyId: family.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      familyId: family.id,
      role: Role.OWNER,
    },
  })

  console.log('✅ Created demo user and membership')

  // Create persons across 3 generations
  const persons = await Promise.all([
    // Generation 1 (Grandparents)
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Robert',
        familyName: 'Smith',
        gender: 'male',
        birthDate: new Date('1940-05-15'),
        deathDate: new Date('2020-03-10'),
        notes: 'Loved gardening and telling stories to his grandchildren.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Margaret',
        familyName: 'Smith',
        gender: 'female',
        birthDate: new Date('1942-08-22'),
        notes: 'Still active in the community, volunteers at the local library.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'William',
        familyName: 'Johnson',
        gender: 'male',
        birthDate: new Date('1938-12-03'),
        deathDate: new Date('2018-11-15'),
        notes: 'Served in the Navy, loved fishing.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Eleanor',
        familyName: 'Johnson',
        gender: 'female',
        birthDate: new Date('1941-04-18'),
        notes: 'Retired teacher, still tutors children in reading.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),

    // Generation 2 (Parents)
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Michael',
        familyName: 'Smith',
        gender: 'male',
        birthDate: new Date('1965-07-12'),
        notes: 'Software engineer, enjoys hiking and photography.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Sarah',
        familyName: 'Smith',
        gender: 'female',
        birthDate: new Date('1968-09-25'),
        notes: 'Graphic designer, passionate about art and travel.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'David',
        familyName: 'Johnson',
        gender: 'male',
        birthDate: new Date('1963-01-14'),
        notes: 'Doctor, volunteers at free clinics.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),

    // Generation 3 (Children)
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Emma',
        familyName: 'Smith',
        gender: 'female',
        birthDate: new Date('1995-03-08'),
        notes: 'College student studying environmental science.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'James',
        familyName: 'Smith',
        gender: 'male',
        birthDate: new Date('1998-11-20'),
        notes: 'High school senior, interested in robotics.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
    prisma.person.create({
      data: {
        familyId: family.id,
        givenName: 'Sophie',
        familyName: 'Johnson',
        gender: 'female',
        birthDate: new Date('1992-06-30'),
        notes: 'Marketing professional, loves cooking and yoga.',
        privacy: {
          birthDate: 'family',
          deathDate: 'family',
          notes: 'family',
        },
      },
    }),
  ])

  console.log('✅ Created', persons.length, 'persons')

  // Create relationships
  const relationships = await Promise.all([
    // Robert and Margaret are parents of Michael
    prisma.relationship.create({
      data: {
        parentId: persons[0].id, // Robert
        childId: persons[4].id,  // Michael
      },
    }),
    prisma.relationship.create({
      data: {
        parentId: persons[1].id, // Margaret
        childId: persons[4].id,  // Michael
      },
    }),

    // William and Eleanor are parents of Sarah
    prisma.relationship.create({
      data: {
        parentId: persons[2].id, // William
        childId: persons[5].id,  // Sarah
      },
    }),
    prisma.relationship.create({
      data: {
        parentId: persons[3].id, // Eleanor
        childId: persons[5].id,  // Sarah
      },
    }),

    // Michael and Sarah are parents of Emma and James
    prisma.relationship.create({
      data: {
        parentId: persons[4].id, // Michael
        childId: persons[7].id,  // Emma
      },
    }),
    prisma.relationship.create({
      data: {
        parentId: persons[5].id, // Sarah
        childId: persons[7].id,  // Emma
      },
    }),
    prisma.relationship.create({
      data: {
        parentId: persons[4].id, // Michael
        childId: persons[8].id,  // James
      },
    }),
    prisma.relationship.create({
      data: {
        parentId: persons[5].id, // Sarah
        childId: persons[8].id,  // James
      },
    }),

    // William and Eleanor are parents of David
    prisma.relationship.create({
      data: {
        parentId: persons[2].id, // William
        childId: persons[6].id,  // David
      },
    }),
    prisma.relationship.create({
      data: {
        parentId: persons[3].id, // Eleanor
        childId: persons[6].id,  // David
      },
    }),

    // David is parent of Sophie
    prisma.relationship.create({
      data: {
        parentId: persons[6].id, // David
        childId: persons[9].id,  // Sophie
      },
    }),
  ])

  console.log('✅ Created', relationships.length, 'parent-child relationships')

  // Create spouse relationships
  const spouses = await Promise.all([
    // Robert and Margaret are married
    prisma.spouse.create({
      data: {
        aId: persons[0].id, // Robert
        bId: persons[1].id, // Margaret
        startDate: new Date('1960-06-15'),
      },
    }),

    // William and Eleanor are married
    prisma.spouse.create({
      data: {
        aId: persons[2].id, // William
        bId: persons[3].id, // Eleanor
        startDate: new Date('1962-09-08'),
      },
    }),

    // Michael and Sarah are married
    prisma.spouse.create({
      data: {
        aId: persons[4].id, // Michael
        bId: persons[5].id, // Sarah
        startDate: new Date('1990-05-20'),
      },
    }),
  ])

  console.log('✅ Created', spouses.length, 'spouse relationships')

  // Create memories
  const memories = await Promise.all([
    prisma.memory.create({
      data: {
        familyId: family.id,
        authorId: user.id,
        title: 'Grandpa Robert\'s Garden',
        body: 'Remembering Grandpa Robert\'s beautiful rose garden. He spent hours tending to his flowers and always had the best stories to tell while we helped him water the plants.',
        taggedPersonIds: [persons[0].id], // Robert
      },
    }),
    prisma.memory.create({
      data: {
        familyId: family.id,
        authorId: user.id,
        title: 'Family Reunion 2019',
        body: 'What a wonderful day! Everyone gathered at Grandma Margaret\'s house for our annual family reunion. The kids played in the backyard while the adults caught up on all the news.',
        taggedPersonIds: [persons[1].id, persons[7].id, persons[8].id], // Margaret, Emma, James
      },
    }),
    prisma.memory.create({
      data: {
        familyId: family.id,
        authorId: user.id,
        title: 'Emma\'s Graduation',
        body: 'So proud of Emma graduating with honors in Environmental Science! She\'s following her passion for protecting our planet. Can\'t wait to see what she accomplishes next.',
        taggedPersonIds: [persons[7].id], // Emma
      },
    }),
  ])

  console.log('✅ Created', memories.length, 'memories')

  console.log('🎉 Seed completed successfully!')
  console.log('📧 Login with: demo@familylink.com')
  console.log('🏠 Family slug: the-demo-family')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
