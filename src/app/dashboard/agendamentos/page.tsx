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
                servico: true,
                colaborador: true,
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
        // Add other fields if necessary, explicitly avoiding Decimal
        // If 'comissao' exists and is needed, format it: comissao: Number(c.comissao)
    }))

    const formattedAgendamentos = agendamentos.map(a => ({
        id: a.id,
        data: a.data,
        status: a.status,
        clienteId: a.clienteId, // Raw ID for form
        servicoId: a.servicoId, // Raw ID for form
        colaboradorId: a.colaboradorId, // Raw ID for form
        observacoes: a.observacoes,
        cliente: {
            nome: a.cliente.nome,
            telefone: a.cliente.telefone
        },
        servico: {
            id: a.servico.id,
            nome: a.servico.nome,
            preco: Number(a.servico.preco),
            duracaoMin: a.servico.duracaoMin,
            ativo: a.servico.ativo,
            criadoEm: a.servico.criadoEm,
            atualizadoEm: a.servico.atualizadoEm
        },
        colaborador: a.colaborador ? {
            id: a.colaborador.id,
            nome: a.colaborador.nome
        } : null
    }))

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
