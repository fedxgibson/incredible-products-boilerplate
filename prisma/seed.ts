import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the password
  const hashedPassword = await hash('Test1234567890!', 12)

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test1@example.com',
      name: 'Test User',
      password: hashedPassword
    },
  })

  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })