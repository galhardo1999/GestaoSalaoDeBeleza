import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { AgendamentosClient } from "./agendamentos-client"
import { redirect } from "next/navigation"
import { expireAppointments } from "@/lib/agendamento-utils"
import { SelectCompanyState } from "@/components/dashboard/select-company-state"

export default async function AgendamentosPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>
}) {
    // Verificar agendamentos expirados ao carregar a página
    await expireAppointments()

    const params = await searchParams
    const dateParam = params.date

    // ... 

    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        if (session?.user?.cargo === "SUPER_ADMIN") {
            return <SelectCompanyState />
        }
        redirect("/login")
    }

    const where: Prisma.AgendamentoWhereInput = {
        empresaId: session.user.empresaId,
    }

    const [agendamentos, user] = await Promise.all([
        db.agendamento.findMany({
            where,
            include: {
                cliente: true,
                colaborador: true,
                agendamento_itens: {
                    include: {
                        servicos: true,
                        colaboradores: true,
                    }
                }
            },
            orderBy: {
                data: 'asc',
            },
        }),
        session?.user?.id ? db.usuario.findUnique({
            where: { id: session.user.id },
            include: { empresa: true }
        }) : null
    ])

    const clientes = await db.cliente.findMany({
        where: { empresaId: session.user.empresaId },
        orderBy: { nome: 'asc' }
    })

    const servicos = await db.servico.findMany({
        where: { ativo: true, empresaId: session.user.empresaId },
        orderBy: { nome: 'asc' }
    })

    const colaboradores = await db.colaborador.findMany({
        where: { empresaId: session.user.empresaId },
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

    const formattedColaboradores = colaboradores.map(c => ({
        id: c.id,
        nome: c.nome,
    }))

    // Format agendamentos with itens (services)
    const formattedAgendamentos = agendamentos.map(a => {
        // Get first service item for backward compatibility with single-service display
        const firstItem = a.agendamento_itens[0]

        return {
            id: a.id,
            data: a.data,
            status: a.status,
            clienteId: a.clienteId,
            valor: a.valor ? Number(a.valor) : null,
            colaboradorId: a.colaboradorId,
            observacoes: a.observacoes,
            cliente: {
                nome: a.cliente.nome,
                telefone: a.cliente.telefone
            },
            // For backward compatibility - show first service or null
            servico: firstItem ? {
                id: firstItem.servicos.id,
                nome: firstItem.servicos.nome,
                preco: Number(firstItem.preco),
                duracaoMin: firstItem.duracao,
            } : null,
            // All services for this appointment
            itens: a.agendamento_itens.map(item => ({
                id: item.id,
                servico: {
                    id: item.servicos.id,
                    nome: item.servicos.nome,
                },
                colaborador: {
                    id: item.colaboradores.id,
                    nome: item.colaboradores.nome,
                },
                preco: Number(item.preco),
                duracao: item.duracao,
            })),
            colaborador: a.colaborador ? {
                id: a.colaborador.id,
                nome: a.colaborador.nome
            } : null
        }
    })

    const whatsappTemplate = user?.empresa?.mensagemWhatsapp

    return (
        <AgendamentosClient
            initialAgendamentos={formattedAgendamentos}
            clientes={clientes}
            servicos={formattedServicos}
            colaboradores={formattedColaboradores}
            whatsappTemplate={whatsappTemplate}
            filteredDate={dateParam}
        />
    )
}
