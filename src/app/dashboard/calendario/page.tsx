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
        criadoEm: s.criadoEm.toISOString(),
        atualizadoEm: s.atualizadoEm.toISOString(),
        empresaId: s.empresaId
    }))

    // Serializar colaboradores para evitar erros de Decimal
    const formattedColaboradores = colaboradores.map(c => ({
        id: c.id,
        codigo: c.codigo,
        nome: c.nome,
        email: c.email,
        cpf: c.cpf,
        foto: c.foto,
        comissaoTipo: c.comissaoTipo,
        comissaoValor: c.comissaoValor ? Number(c.comissaoValor) : null,
        criadoEm: c.criadoEm.toISOString(),
        atualizadoEm: c.atualizadoEm.toISOString(),
        empresaId: c.empresaId
    }))

    // Serializar agendamentos para garantir tipos corretos
    const formattedAgendamentos = agendamentos.map(apt => ({
        id: apt.id,
        data: apt.data.toISOString(),
        status: apt.status.toString(),
        valor: apt.valor ? Number(apt.valor) : null,
        observacoes: apt.observacoes,
        clienteId: apt.clienteId,
        cliente: apt.cliente ? {
            id: apt.cliente.id,
            nome: apt.cliente.nome,
            email: apt.cliente.email,
            telefone: apt.cliente.telefone
        } : null,
        servicoId: apt.servicoId,
        servico: {
            id: apt.servico.id,
            nome: apt.servico.nome,
            preco: Number(apt.servico.preco),
            duracaoMin: apt.servico.duracaoMin,
            ativo: apt.servico.ativo,
            criadoEm: apt.servico.criadoEm.toISOString(),
            atualizadoEm: apt.servico.atualizadoEm.toISOString(),
            empresaId: apt.servico.empresaId
        },
        colaboradorId: apt.colaboradorId,
        colaborador: apt.colaborador ? {
            id: apt.colaborador.id,
            nome: apt.colaborador.nome,
            email: apt.colaborador.email,
            foto: apt.colaborador.foto,
            comissaoTipo: apt.colaborador.comissaoTipo,
            comissaoValor: apt.colaborador.comissaoValor ? Number(apt.colaborador.comissaoValor) : null
        } : null,
        empresaId: apt.empresaId,
        usuarioId: apt.usuarioId,
        criadoEm: apt.criadoEm.toISOString(),
        atualizadoEm: apt.atualizadoEm.toISOString()
    }))

    // Serializar clientes
    const formattedClientes = clientes.map(c => ({
        id: c.id,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        cpf: c.cpf,
        dataNascimento: c.dataNascimento ? c.dataNascimento.toISOString() : null,
        criadoEm: c.criadoEm.toISOString(),
        atualizadoEm: c.atualizadoEm.toISOString(),
        empresaId: c.empresaId
    }))

    return (
        <div className="p-8 h-full">
            <CalendarView
                agendamentos={formattedAgendamentos}
                clientes={formattedClientes}
                servicos={formattedServicos}
                colaboradores={formattedColaboradores}
            />
        </div>
    )
}
