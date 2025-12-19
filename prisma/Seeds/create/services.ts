
import { db } from '../../../src/lib/db'
import { faker } from '@faker-js/faker'

async function main() {
    console.log('🌱 Starting Service Seeding...')

    const empresas = await db.empresa.findMany({ take: 1 })
    if (empresas.length === 0) {
        console.error('❌ Nenhuma empresa encontrada.')
        process.exit(1)
    }
    const empresaId = empresas[0].id

    // Random number between 5 and 10
    const count = faker.number.int({ min: 5, max: 10 })
    console.log(`Creating ${count} services for empresa: ${empresas[0].nome}`)

    const serviceNames = [
        'Corte Masculino', 'Corte Feminino', 'Barba', 'Sobrancelha',
        'Manicure', 'Pedicure', 'Hidratação', 'Tintura',
        'Limpeza de Pele', 'Massagem', 'Depilação', 'Maquiagem'
    ]

    for (let i = 0; i < count; i++) {
        // Pick a name from the list or generate one if list exhausted (though count is small)
        const name = serviceNames[i] || faker.commerce.productName()
        const preco = faker.number.float({ min: 20, max: 200, multipleOf: 5 }) // Prices like 20, 25, 30...
        const duracao = faker.number.int({ min: 15, max: 120 })

        await db.servico.create({
            data: {
                nome: name,
                preco: preco,
                duracaoMin: duracao,
                ativo: true,
                empresaId: empresaId,
            }
        })
    }

    console.log(`✅ Created ${count} services successfully.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
