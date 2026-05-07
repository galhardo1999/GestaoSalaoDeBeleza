import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Scissors, Users, XCircle, ArrowUpRight } from "lucide-react"

interface DashboardMetricsMonthProps {
    date: Date
    empresaId: string
}

export async function DashboardMetricsMonth({ date, empresaId }: DashboardMetricsMonthProps) {
    const year = date.getFullYear()
    const month = date.getMonth()

    // Boundaries for the current month
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0))
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59))

    // Boundaries for the previous month
    const prevStartOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
    const prevEndOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59))

    // Fetch this month's data
    const agendamentosEsteMes = await db.agendamento.findMany({
        where: {
            empresaId,
            data: { gte: startOfMonth, lt: endOfMonth },
        },
        select: {
            status: true,
            valor: true,
            agendamento_itens: { select: { id: true } }
        }
    })

    // Fetch previous month's data for comparison
    const agendamentosMesPassado = await db.agendamento.findMany({
        where: {
            empresaId,
            data: { gte: prevStartOfMonth, lt: prevEndOfMonth },
        },
        select: {
            status: true,
            valor: true,
        }
    })

    // Receita Total
    const receitaTotal = agendamentosEsteMes
        .filter(a => a.status !== 'CANCELADO')
        .reduce((sum, a) => sum + Number(a.valor || 0), 0)
    
    const receitaTotalMesPassado = agendamentosMesPassado
        .filter(a => a.status !== 'CANCELADO')
        .reduce((sum, a) => sum + Number(a.valor || 0), 0)

    const diffReceita = receitaTotal - receitaTotalMesPassado

    // Serviços realizados (contagem de agendamento_itens)
    const servicosRealizados = agendamentosEsteMes
        .filter(a => a.status !== 'CANCELADO')
        .reduce((sum, a) => sum + a.agendamento_itens.length, 0)
    
    const ticketMedio = servicosRealizados > 0 ? receitaTotal / servicosRealizados : 0

    // Novos clientes (criadoEm neste mês)
    const clientesNovosEsteMes = await db.cliente.count({
        where: {
            empresaId,
            criadoEm: { gte: startOfMonth, lt: endOfMonth }
        }
    })

    const totalClientesBase = await db.cliente.count({ where: { empresaId } })

    // Cancelamentos
    const cancelamentosEsteMes = agendamentosEsteMes.filter(a => a.status === 'CANCELADO').length
    const totalAgendamentosEsteMes = agendamentosEsteMes.length
    const taxaCancelamento = totalAgendamentosEsteMes > 0 ? (cancelamentosEsteMes / totalAgendamentosEsteMes) * 100 : 0

    const metricas = [
        {
            titulo: "Receita total",
            valor: receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            apoio: "vs mês ant.",
            diff: diffReceita,
            prefix: "R$ ",
            suffix: "",
            Icone: DollarSign,
        },
        {
            titulo: "Serviços realizados",
            valor: servicosRealizados.toString(),
            apoio: `ticket médio R$ ${ticketMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            diff: null,
            prefix: "",
            suffix: "",
            Icone: Scissors,
        },
        {
            titulo: "Novos clientes",
            valor: clientesNovosEsteMes.toString(),
            apoio: `total: ${totalClientesBase}`,
            diff: null,
            prefix: "",
            suffix: "",
            Icone: Users,
        },
        {
            titulo: "Cancelamentos",
            valor: cancelamentosEsteMes.toString(),
            apoio: "da taxa",
            diff: -taxaCancelamento, // Using negative to show in red, although it's a rate.
            diffText: `${taxaCancelamento.toFixed(1)}%`,
            prefix: "",
            suffix: "",
            Icone: XCircle,
        },
    ]

    return (
        <>
            {metricas.map(({ titulo, valor, apoio, diff, diffText, prefix, suffix, Icone }) => {
                const isPositive = diff !== null && diff >= 0;
                const showDiff = diff !== null;
                const diffValue = diffText || (diff !== null ? (titulo === 'Receita total' ? `R$ ${Math.abs(diff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : Math.abs(diff)) : '');

                // Se for cancelamentos, uma taxa alta é ruim (então "positive" math is inverted visual)
                const isGood = titulo === "Cancelamentos" ? diff === 0 : isPositive;
                const badgeClass = isGood ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500';

                return (
                    <Card key={titulo} className="group relative overflow-hidden rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
                        <div className="absolute inset-x-0 top-0 h-px bg-dashboard-primary/20" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-2 pt-5">
                            <CardTitle className="text-[13px] font-semibold text-dashboard-muted flex items-center gap-2">
                                <Icone className="h-4 w-4 text-dashboard-subtle" />
                                {titulo}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="font-heading text-3xl font-semibold leading-none text-dashboard-foreground mt-2 mb-3">
                                {prefix}{valor}{suffix}
                            </div>
                            <div className="flex items-center gap-2">
                                {showDiff ? (
                                    <>
                                        <span className={`inline-flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                                            {titulo !== 'Cancelamentos' && (
                                                <ArrowUpRight className={`h-3 w-3 ${isPositive ? '' : 'rotate-90'}`} />
                                            )}
                                            {diffValue}
                                        </span>
                                        <span className="text-[11px] font-medium text-dashboard-subtle">{apoio}</span>
                                    </>
                                ) : (
                                    <span className="text-[11px] font-medium text-dashboard-subtle">{apoio}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </>
    )
}

export function DashboardMetricsMonthSkeleton() {
    return (
        <>
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="relative overflow-hidden rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-2 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-pulse rounded bg-dashboard-border" />
                            <div className="h-4 w-24 animate-pulse rounded bg-dashboard-border" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="mb-3 mt-2 h-8 w-20 animate-pulse rounded bg-dashboard-border" />
                        <div className="h-4 w-32 animate-pulse rounded bg-dashboard-border" />
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
