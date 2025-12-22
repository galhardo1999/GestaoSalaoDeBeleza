
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            cnpj: true,
            cargo: true,
        }
    })
    console.log("Registered Users:", users)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
