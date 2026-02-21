import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  // 1. Create a standard Postgres connection pool
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  })
  
  // 2. Wrap it in Prisma's Postgres adapter
  const adapter = new PrismaPg(pool)

  // 3. Pass the adapter to PrismaClient
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma