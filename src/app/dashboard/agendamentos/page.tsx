import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { AgendamentosClient } from "./agendamentos-client"
import { expireAppointments } from "@/lib/agendamento-utils"

export default async function AgendamentosPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; status?: string; date?: string }>
}) {
    // Check for expired appointments on page load
    await expireAppointments()

    const session = await getServerSession(authOptions)
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ''
    const status = params.status
    // Default to today if no date provided, unless 'all' is specified
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    const todayStr = today.toISOString().split('T')[0]

    // Logic: 
    // - If params.date exists and is not 'all', use it.
    // - If params.date is 'all', use null (no filter).
    // - If params.date is missing, use todayStr.
    const dateStr = params.date === 'all' ? null : (params.date || todayStr)

    // Construct start and end dates for Prisma query respecting Brazil time (UTC-3)
    // Brazil 00:00 is UTC 03:00.
    // So we search from ${dateStr}T03:00:00Z to +24h
    let dateFilter: Prisma.DateTimeFilter | undefined = undefined

    if (dateStr) {
        const startOfDay = new Date(`${dateStr}T03:00:00Z`)
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

        // Validation to ensure valid dates
        if (!isNaN(startOfDay.getTime())) {
            dateFilter = {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    }

    const itemsPerPage = 10
    const skip = (currentPage - 1) * itemsPerPage

    const where: Prisma.AgendamentoWhereInput = {
        AND: [
            query ? {
                OR: [
                    { cliente: { nome: { contains: query, mode: Prisma.QueryMode.insensitive } } },
                    { servico: { nome: { contains: query, mode: Prisma.QueryMode.insensitive } } },
                ]
            } : {},
            status && status !== 'todos' ? { status: status as any } : {},
            dateFilter ? { data: dateFilter } : {}
        ]
    }

    const [totalItems, agendamentos, user] = await Promise.all([
        db.agendamento.count({ where }),
        db.agendamento.findMany({
            where,
            include: {
                cliente: true,
                servico: true,
                colaborador: true,
            },
            orderBy: {
                data: 'desc',
            },
            skip,
            take: itemsPerPage,
        }),
        session?.user?.id ? db.usuario.findUnique({
            where: { id: session.user.id },
            include: { empresa: true }
        }) : null
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const clientes = await db.cliente.findMany({
        orderBy: { nome: 'asc' }
    })

    const servicos = await db.servico.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
    })

    const colaboradores = await db.colaborador.findMany({
        orderBy: { nome: 'asc' }
    })

    const formattedServicos = servicos.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco),
        duracaoMin: s.duracaoMin,
        ativo: s.ativo,
        criadoEm: s.criadoEm,
        atualizadoEm: s.atualizadoEm
    }))

    const formattedAgendamentos = agendamentos.map(a => ({
        ...a,
        servico: {
            id: a.servico.id,
            nome: a.servico.nome,
            preco: Number(a.servico.preco),
            duracaoMin: a.servico.duracaoMin,
            ativo: a.servico.ativo,
            criadoEm: a.servico.criadoEm,
            atualizadoEm: a.servico.atualizadoEm
        }
    }))

    const whatsappTemplate = user?.empresa?.mensagemWhatsapp

    return (
        <AgendamentosClient
            agendamentos={formattedAgendamentos}
            clientes={clientes}
            servicos={formattedServicos}
            colaboradores={colaboradores}
            pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems
            }}
            whatsappTemplate={whatsappTemplate}
            filteredDate={dateStr}
        />
    )
}
