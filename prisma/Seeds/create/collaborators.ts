
import { db } from '../../../src/lib/db'
import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'

async function main() {
    console.log('🌱 Starting Collaborator Seeding...')

    const empresas = await db.empresa.findMany({ take: 1 })
    if (empresas.length === 0) {
        console.error('❌ Nenhuma empresa encontrada.')
        process.exit(1)
    }
    const empresaId = empresas[0].id

    // Random number between 8 and 15
    const count = faker.number.int({ min: 8, max: 15 })
    console.log(`Creating ${count} collaborators for empresa: ${empresas[0].nome}`)

    const defaultPassword = await hash('123456', 10)

    for (let i = 0; i < count; i++) {
        await db.colaborador.create({
            data: {
                nome: faker.person.fullName(),
                email: faker.internet.email(),
                cpf: faker.string.numeric(11),
                senha: defaultPassword,
                foto: null,
                empresaId: empresaId,
            }
        })
    }

    console.log(`✅ Created ${count} collaborators successfully.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
