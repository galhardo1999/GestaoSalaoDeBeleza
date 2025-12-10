import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding ...')

    // Create Empresa
    const empresa = await prisma.empresa.upsert({
        where: { cnpj: '00.000.000/0000-00' },
        update: {},
        create: {
            nome: 'Beleza Premium',
            cnpj: '00.000.000/0000-00',
            telefone1: '(11) 99999-9999',
            endereco: 'Rua Exemplo, 123 - Centro, São Paulo - SP',
        },
    })

    console.log('Created empresa:', empresa)

    // Create Admin User linked to Empresa
    const password = await hash('123456', 10)

    const user = await prisma.usuario.upsert({
        where: { cnpj: '00.000.000/0001-91' }, // Using a different CNPJ for user login if needed, or same if user is the company rep
        update: {
            empresaId: empresa.id
        },
        create: {
            nome: 'Admin',
            cnpj: '00.000.000/0001-91',
            senha: password,
            cargo: 'ADMIN',
            empresaId: empresa.id,
        },
    })

    console.log('Created user:', user)

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
