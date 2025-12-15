
import { db as prisma } from '../src/lib/db'
import { hash } from 'bcryptjs'

// const prisma = new PrismaClient()

async function main() {
    // 1. Clean up database
    // We delete in order to avoid foreign key constraints
    await prisma.agendamento.deleteMany()
    await prisma.servico.deleteMany()
    await prisma.colaborador.deleteMany()
    await prisma.cliente.deleteMany()
    await prisma.usuario.deleteMany()
    await prisma.empresa.deleteMany()

    console.log('Database cleaned')

    const password = await hash('123456', 10)

    // 2. Create Super Admin
    await prisma.usuario.create({
        data: {
            nome: 'Super Admin',
            cnpj: '99.999.999/9999-99',
            senha: password,
            cargo: 'SUPER_ADMIN',
            // No empresaId for Super Admin
        }
    })
    console.log('Super Admin created')

    // 3. Create Company 1
    const company1 = await prisma.empresa.create({
        data: {
            nome: 'Beleza Premium',
            cnpj: '11.111.111/0001-11',
            telefone1: '11999999999',
            endereco: 'Rua das Flores, 123'
        }
    })
    console.log('Company 1 created')

    // 4. Create 5 Users for Company 1
    for (let i = 1; i <= 5; i++) {
        await prisma.usuario.create({
            data: {
                nome: `Usuario ${i} - Empresa 1`,
                cnpj: `11.111.111/000${i}-11`, // Unique CNPJs based on company pattern
                senha: password,
                cargo: i === 1 ? 'ADMIN' : 'FUNCIONARIO', // First one is Admin
                empresaId: company1.id
            }
        })
    }
    console.log('5 Users for Company 1 created')

    // 5. Create Company 2
    const company2 = await prisma.empresa.create({
        data: {
            nome: 'Estilo & Corte',
            cnpj: '22.222.222/0001-22',
            telefone1: '22999999999',
            endereco: 'Av. Brasil, 456'
        }
    })
    console.log('Company 2 created')

    // 6. Create 3 Users for Company 2
    for (let i = 1; i <= 3; i++) {
        await prisma.usuario.create({
            data: {
                nome: `Usuario ${i} - Empresa 2`,
                cnpj: `22.222.222/000${i}-22`,
                senha: password,
                cargo: i === 1 ? 'ADMIN' : 'FUNCIONARIO',
                empresaId: company2.id
            }
        })
    }
    console.log('3 Users for Company 2 created')
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
