import { db } from "@/lib/db"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SelectCompanyState } from "@/components/dashboard/select-company-state"

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        if (session?.user?.cargo === "SUPER_ADMIN") {
            return (
                <div className="p-8 h-full">
                    <SelectCompanyState />
                </div>
            )
        }
        redirect('/login')
    }
    const empresaId = session.user.empresaId

    const [agendamentos, clientes, servicos, colaboradores] = await Promise.all([
        db.agendamento.findMany({
            where: { empresaId },
            include: {
                cliente: true,
                servico: true,
                colaborador: true,
            }
        }),
        db.cliente.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' }
        }),
        db.servico.findMany({
            where: { ativo: true, empresaId },
            orderBy: { nome: 'asc' }
        }),
        db.colaborador.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' }
        })
    ])

    const formattedServicos = servicos.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco),
        duracaoMin: s.duracaoMin,
        ativo: s.ativo,
        criadoEm: s.criadoEm,
        atualizadoEm: s.atualizadoEm,
        empresaId: s.empresaId
    }))

    // No entanto, para ser seguro e limpo:
    const formattedAgendamentos = agendamentos.map(apt => ({
        id: apt.id,
        data: apt.data,
        status: apt.status.toString(), // Garantir que enum seja string
        valor: apt.valor ? Number(apt.valor) : null,
        observacoes: apt.observacoes,
        clienteId: apt.clienteId,
        cliente: apt.cliente,
        servicoId: apt.servicoId,
        servico: {
            id: apt.servico.id,
            nome: apt.servico.nome,
            preco: Number(apt.servico.preco),
            duracaoMin: apt.servico.duracaoMin,
            ativo: apt.servico.ativo,
            criadoEm: apt.servico.criadoEm,
            atualizadoEm: apt.servico.atualizadoEm,
            empresaId: apt.servico.empresaId
        },
        colaboradorId: apt.colaboradorId,
        colaborador: apt.colaborador,
        empresaId: apt.empresaId,
        usuarioId: apt.usuarioId,
        criadoEm: apt.criadoEm,
        atualizadoEm: apt.atualizadoEm
    }))

    return (
        <div className="p-8 h-full">
            <CalendarView
                agendamentos={formattedAgendamentos}
                clientes={clientes}
                servicos={formattedServicos}
                colaboradores={colaboradores}
            />
        </div>
    )
}
