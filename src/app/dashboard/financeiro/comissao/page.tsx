import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SelectCompanyState } from "@/components/dashboard/select-company-state"
import { ComissaoClient } from "./comissao-client"

export default async function ComissaoPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        if (session?.user?.cargo === "SUPER_ADMIN") {
            return <SelectCompanyState />
        }
        redirect("/login")
    }

    // Buscar agendamentos concluídos da empresa
    const [agendamentosRaw, colaboradoresRaw] = await Promise.all([
        db.agendamento.findMany({
            where: {
                empresaId: session.user.empresaId,
                status: "CONCLUIDO",
                colaboradorId: { not: null }
            },
            include: {
                cliente: { select: { nome: true } },
                servico: { select: { nome: true } },
                colaborador: true
            },
            orderBy: { data: 'desc' }
        }),
        db.colaborador.findMany({
            where: { empresaId: session.user.empresaId },
            orderBy: { nome: 'asc' }
        })
    ]) as any[]

    const formattedAgendamentos = agendamentosRaw.map((ag: any) => ({
        id: ag.id,
        data: ag.data.toISOString(),
        valor: Number(ag.valor || 0),
        clienteNome: ag.cliente?.nome || "",
        servicoNome: ag.servico?.nome || "",
        colaboradorId: ag.colaboradorId || "",
        colaboradorNome: ag.colaborador?.nome || "",
        comissaoTipo: ag.colaborador?.comissaoTipo || "PORCENTAGEM",
        comissaoValor: ag.colaborador?.comissaoValor ? Number(ag.colaborador.comissaoValor) : null
    }))

    const formattedColaboradores = colaboradoresRaw.map((col: any) => ({
        id: col.id,
        nome: col.nome,
        comissaoTipo: col.comissaoTipo || "PORCENTAGEM",
        comissaoValor: col.comissaoValor ? Number(col.comissaoValor) : null
    }))

    return (
        <ComissaoClient
            agendamentos={formattedAgendamentos}
            colaboradores={formattedColaboradores}
        />
    )
}
