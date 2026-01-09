import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? (() => {
    const connectionString = `${process.env.DATABASE_URL}`
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    // P1: Conditional logging - only log queries in development
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
