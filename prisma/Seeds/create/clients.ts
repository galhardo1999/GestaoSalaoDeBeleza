
import { db } from '../../../src/lib/db'
import { faker } from '@faker-js/faker'

async function main() {
    console.log('🌱 Starting Client Seeding...')

    const empresas = await db.empresa.findMany({ take: 1 })
    if (empresas.length === 0) {
        console.error('❌ Nenhuma empresa encontrada. Crie uma empresa antes de rodar os seeds.')
        process.exit(1)
    }
    const empresaId = empresas[0].id

    // Random number between 30 and 50
    const count = faker.number.int({ min: 30, max: 50 })
    console.log(`Creating ${count} clients for empresa: ${empresas[0].nome}`)

    for (let i = 0; i < count; i++) {
        await db.cliente.create({
            data: {
                nome: faker.person.fullName(),
                email: faker.internet.email(),
                telefone: faker.phone.number(), // Generate generic phone
                cpf: faker.string.numeric(11),
                observacoes: faker.lorem.sentence(),
                empresaId: empresaId,
            }
        })
    }

    console.log(`✅ Created ${count} clients successfully.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // We don't disconnect the shared instance usually, but for a script it's fine or we let process exit handle it
        // db.$disconnect() 
    })
