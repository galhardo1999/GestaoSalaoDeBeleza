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
                // Removido filtro estrito de colaboradorId not null no pai, 
                // pois podemos ter collab apenas nos itens
            },
            include: {
                cliente: { select: { nome: true } },
                agendamento_itens: {
                    include: {
                        servicos: { select: { nome: true, preco: true } },
                        colaboradores: true
                    }
                },
                colaborador: true
            },
            orderBy: { data: 'desc' }
        }),
        db.colaborador.findMany({
            where: { empresaId: session.user.empresaId },
            orderBy: { nome: 'asc' }
        })
    ]) as any[]

    const formattedAgendamentos = agendamentosRaw.flatMap((ag: any) => {
        // Lógica para novos agendamentos (com itens)
        if (ag.agendamento_itens && ag.agendamento_itens.length > 0) {
            return ag.agendamento_itens.map((item: any) => {
                const col = item.colaboradores

                // Se o item não tem colaborador, não gera comissão
                if (!col) return null

                return {
                    id: `${ag.id}-${item.id}`,
                    data: ag.data.toISOString(),
                    valor: Number(item.preco || 0),
                    clienteNome: ag.cliente?.nome || "",
                    servicoNome: item.servicos?.nome || "",
                    colaboradorId: col.id,
                    colaboradorNome: col.nome,
                    comissaoTipo: col.comissaoTipo || "PORCENTAGEM",
                    comissaoValor: col.comissaoValor ? Number(col.comissaoValor) : null
                }
            }).filter(Boolean)
        }

        // Fallback para legado (sem itens)
        // Só retorna se tiver colaborador principal definido
        if (!ag.colaboradorId) return []

        const firstItem = ag.agendamento_itens?.[0]
        const itemsTotal = ag.agendamento_itens?.reduce((sum: number, item: any) => sum + Number(item.preco || 0), 0) || 0

        return [{
            id: ag.id,
            data: ag.data.toISOString(),
            valor: Number(ag.valor || itemsTotal || 0),
            clienteNome: ag.cliente?.nome || "",
            servicoNome: firstItem?.servicos?.nome || "Serviço (Legado)",
            colaboradorId: ag.colaboradorId,
            colaboradorNome: ag.colaborador?.nome || "",
            comissaoTipo: ag.colaborador?.comissaoTipo || "PORCENTAGEM",
            comissaoValor: ag.colaborador?.comissaoValor ? Number(ag.colaborador.comissaoValor) : null
        }]
    })

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
