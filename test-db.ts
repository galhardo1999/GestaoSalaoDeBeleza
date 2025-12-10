import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    log: ['info']
})

async function main() {
    console.log('Testing Prisma Connection...')
    try {
        const count = await prisma.usuario.count()
        console.log('User count:', count)
        console.log('Prisma initialized successfully.')
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
