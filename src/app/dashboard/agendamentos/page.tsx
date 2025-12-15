import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { AgendamentosClient } from "./agendamentos-client"
import { redirect } from "next/navigation"
import { expireAppointments } from "@/lib/agendamento-utils"

export default async function AgendamentosPage() {
    // Verificar agendamentos expirados ao carregar a página
    await expireAppointments()

    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) redirect("/login")

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
            initialAgendamentos={formattedAgendamentos}
            clientes={clientes}
            servicos={formattedServicos}
            colaboradores={colaboradores}
            whatsappTemplate={whatsappTemplate}
        />
    )
}
