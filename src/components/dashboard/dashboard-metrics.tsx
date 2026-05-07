import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign, Clock, ArrowUpRight } from "lucide-react"

interface DashboardMetricsProps {
    date: Date
    empresaId: string
}

export async function DashboardMetrics({ date, empresaId }: DashboardMetricsProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    // Dia selecionado
    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    // Dia anterior
    const prevStartOfDay = new Date(startOfDay)
    prevStartOfDay.setDate(prevStartOfDay.getDate() - 1)
    const prevEndOfDay = new Date(endOfDay)
    prevEndOfDay.setDate(prevEndOfDay.getDate() - 1)

    // Agendamentos HOJE
    const agendamentosHoje = await db.agendamento.findMany({
        where: {
            empresaId,
            data: { gte: startOfDay, lt: endOfDay },
            status: { notIn: ['CANCELADO'] }
        },
        select: {
            id: true,
            valor: true,
            clienteId: true,
            agendamento_itens: { select: { duracao: true } }
        }
    })

    // Agendamentos ONTEM
    const agendamentosOntem = await db.agendamento.findMany({
        where: {
            empresaId,
            data: { gte: prevStartOfDay, lt: prevEndOfDay },
            status: { notIn: ['CANCELADO'] }
        },
        select: {
            id: true,
            valor: true,
            clienteId: true
        }
    })

    // Colaboradores para a taxa de ocupação
    const colaboradores = await db.colaborador.count({ where: { empresaId } })

    // Cálculos HOJE
    const appointmentsCount = agendamentosHoje.length
    const receitaEstimada = agendamentosHoje.reduce((sum, apt) => sum + Number(apt.valor || 0), 0)
    const clientesAtendidos = new Set(agendamentosHoje.map(a => a.clienteId)).size

    // Cálculos ONTEM
    const appointmentsCountOntem = agendamentosOntem.length
    const receitaEstimadaOntem = agendamentosOntem.reduce((sum, apt) => sum + Number(apt.valor || 0), 0)

    // Taxa de Ocupação Aproximada (Ex: 8 horas úteis por colaborador * 60 min = 480 min por colaborador)
    const totalMinutosOcupados = agendamentosHoje.reduce((sum, apt) => {
        const minApt = apt.agendamento_itens.reduce((s, i) => s + (i.duracao || 30), 0)
        return sum + minApt
    }, 0)
    const totalMinutosDisponiveis = colaboradores * 480 || 480 // fallback to 1 colab
    const taxaOcupacao = Math.min(Math.round((totalMinutosOcupados / totalMinutosDisponiveis) * 100), 100)

    const metricas = [
        {
            titulo: "Agendamentos",
            valor: appointmentsCount.toString(),
            apoio: `${appointmentsCount} agendados`, // Ou "vs ontem"
            diff: appointmentsCount - appointmentsCountOntem,
            prefix: "",
            suffix: "",
            Icone: Calendar,
        },
        {
            titulo: "Receita estimada",
            valor: receitaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            apoio: "vs ontem",
            diff: receitaEstimada - receitaEstimadaOntem,
            prefix: "R$ ",
            suffix: "",
            Icone: DollarSign,
        },
        {
            titulo: "Clientes atendidos",
            valor: clientesAtendidos.toString(),
            apoio: `de ${appointmentsCount} agendados`,
            diff: null,
            prefix: "",
            suffix: "",
            Icone: Users,
        },
        {
            titulo: "Ocupação",
            valor: taxaOcupacao.toString(),
            apoio: "horários ocupados",
            diff: null,
            prefix: "",
            suffix: "%",
            Icone: Clock,
        },
    ]

    return (
        <>
            {metricas.map(({ titulo, valor, apoio, diff, prefix, suffix, Icone }) => {
                const isPositive = diff !== null && diff >= 0;
                const showDiff = diff !== null;
                const diffValue = diff !== null ? (titulo === 'Receita estimada' ? `R$ ${Math.abs(diff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : Math.abs(diff)) : '';

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
                                        <span className={`inline-flex items-center gap-0.5 rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <ArrowUpRight className={`h-3 w-3 ${isPositive ? '' : 'rotate-90'}`} />
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

export function DashboardMetricsSkeleton() {
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
