
import { PrismaClient } from '@prisma/client'
import { addDays, subDays, setHours, setMinutes } from 'date-fns'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const EMPRESA_ID = 'cmj6midl0000104jr6a49qzsq'
const USUARIO_ID = 'cmj6miube000204jrhgznq1ja'

async function main() {
    console.log('Iniciando seed...')

    // 1. Criar Serviços
    const servicosData = [
        { nome: 'Corte Masculino', preco: 45.00, duracaoMin: 30 },
        { nome: 'Barba', preco: 35.00, duracaoMin: 30 },
        { nome: 'Corte + Barba', preco: 70.00, duracaoMin: 50 },
        { nome: 'Pézinho', preco: 15.00, duracaoMin: 15 },
        { nome: 'Sobrancelha', preco: 20.00, duracaoMin: 15 },
    ]

    console.log('Criando serviços...')
    const servicos = []
    for (const s of servicosData) {
        const servico = await prisma.servico.create({
            data: {
                ...s,
                empresaId: EMPRESA_ID,
                ativo: true
            }
        })
        servicos.push(servico)
    }

    // 2. Criar Colaboradores
    const colaboradoresData = [
        { nome: 'João Silva', email: 'joao@salao.com' },
        { nome: 'Maria Santos', email: 'maria@salao.com' },
        { nome: 'Pedro Oliveira', email: 'pedro@salao.com' },
    ]

    console.log('Criando colaboradores...')
    const colaboradores = []
    for (const c of colaboradoresData) {
        // Unique email to avoid constraints
        const uniqueEmail = `${c.email.split('@')[0]}_${Date.now()}_${Math.floor(Math.random() * 1000)}@teste.com`

        // Create empty password for testing
        const colaborador = await prisma.colaborador.create({
            data: {
                nome: c.nome,
                email: uniqueEmail,
                senha: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Dummy hash
                empresaId: EMPRESA_ID,
                servicos: {
                    connect: servicos.map(s => ({ id: s.id }))
                }
            }
        })
        colaboradores.push(colaborador)
    }

    // 3. Criar Clientes
    const clientesData = [
        'Carlos Eduardo', 'Ana Paula', 'Roberto Costa', 'Fernanda Lima',
        'Lucas Mendes', 'Juliana Alves', 'Ricardo Gomes', 'Patricia Dias',
        'Bruno Martins', 'Camila Rocha'
    ]

    console.log('Criando clientes...')
    const clientes = []
    for (const nome of clientesData) {
        const cliente = await prisma.cliente.create({
            data: {
                nome,
                telefone: `119${Math.floor(Math.random() * 100000000)}`,
                empresaId: EMPRESA_ID
            }
        })
        clientes.push(cliente)
    }

    // 4. Criar Agendamentos
    console.log('Criando agendamentos...')

    // Create appointments for the last 5 days and next 5 days
    for (let i = -5; i <= 5; i++) {
        const date = addDays(new Date(), i)

        // Create 3-5 appointments per day
        const numAppts = Math.floor(Math.random() * 3) + 3

        for (let j = 0; j < numAppts; j++) {
            const hour = Math.floor(Math.random() * 10) + 9 // 9h to 18h
            const appointmentDate = setMinutes(setHours(date, hour), 0)

            const cliente = clientes[Math.floor(Math.random() * clientes.length)]
            const colaborador = colaboradores[Math.floor(Math.random() * colaboradores.length)]
            const servico = servicos[Math.floor(Math.random() * servicos.length)]

            // Logic for status
            let status = 'AGENDADO'
            if (i < 0) { // Past
                status = Math.random() > 0.3 ? 'CONCLUIDO' : (Math.random() > 0.5 ? 'CANCELADO' : 'NAO_COMPARECEU')
            } else { // Future
                status = 'AGENDADO'
            }

            await prisma.agendamento.create({
                data: {
                    data: appointmentDate,
                    status: status as any,
                    clienteId: cliente.id,
                    colaboradorId: colaborador.id,
                    servicoId: servico.id,
                    usuarioId: USUARIO_ID,
                    empresaId: EMPRESA_ID
                }
            })
        }
    }

    console.log('Seed concluído com sucesso!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
