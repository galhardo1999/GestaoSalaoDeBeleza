import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign } from "lucide-react"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { DashboardDateFilter } from "@/components/dashboard/dashboard-date-filter"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

interface DashboardDataParams {
    period: 'today' | 'week' | 'month'
    empresaId: string
}

async function getDashboardData({ period, empresaId }: DashboardDataParams) {
    // Forçar fuso horário do Brasil para "Hoje"
    // No Brasil, hoje começou às T03:00:00Z (que é 00:00 BRT) se estivermos falando sobre representação UTC do início do dia BRT.
    // Na verdade mais simples: Criar string de data para Brasil, e analisar.

    // auxiliar para obter objeto Date do Brasil calculado corretamente
    const now = new Date()
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

    // Para início/fim do dia, queremos os intervalos que correspondem ao dia do Brasil.
    // Ex: Hoje 00:00 BRT é Hoje 03:00 UTC. Hoje 23:59 BRT é Amanhã 02:59 UTC.
    // Vamos usar manipulação de string para ser seguro e claro.

    let startDate: Date
    let endDate: Date

    if (period === 'today') {
        const todayStr = brazilNow.toISOString().split('T')[0]
        startDate = new Date(`${todayStr}T03:00:00Z`)
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
    } else if (period === 'week') {
        const start = startOfWeek(brazilNow, { weekStartsOn: 0 })
        const end = endOfWeek(brazilNow, { weekStartsOn: 0 })
        // Estes são horário local do servidor (UTC) construídos a partir dos valores de brazilNow.
        // Precisamos deslocá-los para corresponder à expectativa UTC do Prisma para BRT.
        // Na verdade, vamos manter simples. Se usarmos os objetos Date de date-fns em 'brazilNow',
        // eles representam os "valores de tempo" corretos mas em UTC.
        // ex: brazilNow é 16:00. startOfWeek(brazilNow) é Domingo 00:00.
        // Mas Domingo 00:00 em tempo absoluto válido para o Brasil é Domingo 03:00 UTC.
        // Se usarmos apenas startOfWeek(brazilNow), obtemos Domingo 00:00 UTC, que é Sábado 21:00 BRT.
        // Aproximação boa o suficiente? Talvez. Mas "Hoje" é crítico.
        // Vamos manter a lógica precisa de "Hoje" para o período 'today' pois é o solicitado.
        // Para Semana/Mês, talvez aceitável ter leve deslocamento ou corrigir adequadamente.
        // Vamos corrigir adequadamente usando offset.

        // 3 horas em ms
        const offset = 3 * 60 * 60 * 1000
        startDate = new Date(startOfWeek(brazilNow, { weekStartsOn: 0 }).getTime() + offset)
        endDate = new Date(endOfWeek(brazilNow, { weekStartsOn: 0 }).getTime() + offset)

    } else { // mês
        const offset = 3 * 60 * 60 * 1000
        startDate = new Date(startOfMonth(brazilNow).getTime() + offset)
        endDate = new Date(endOfMonth(brazilNow).getTime() + offset)
    }

    const appointmentsCount = await db.agendamento.count({
        where: {
            empresaId, // Escopo por empresa
            data: {
                gte: startDate,
                lt: endDate,
            },
        },
    })

    const totalClients = await db.cliente.count({
        where: {
            empresaId
        }
    })

    const revenueAppointments = await db.agendamento.findMany({
        where: {
            empresaId,
            data: {
                gte: startDate,
                lt: endDate,
            },
            status: {
                in: ['AGENDADO', 'CONCLUIDO']
            }
        },
        include: {
            servico: true
        }
    })

    const projectedRevenue = revenueAppointments.reduce((acc, curr) => {
        return acc + Number(curr.servico.preco)
    }, 0)

    // Agenda de Hoje - Sempre hoje independente do parâmetro period?
    // "Agenda de Hoje" implica Hoje.
    const todayStr = brazilNow.toISOString().split('T')[0]
    const todayStart = new Date(`${todayStr}T03:00:00Z`)
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const upcomingAppointments = await db.agendamento.findMany({
        where: {
            empresaId,
            data: {
                gte: todayStart,
                lt: todayEnd
            }
        },
        orderBy: {
            data: 'asc'
        },
        include: {
            cliente: { select: { nome: true } },
            servico: { select: { nome: true } },
            colaborador: { select: { nome: true } }
        }
    })

    return {
        appointmentsCount,
        totalClients,
        projectedRevenue,
        upcomingAppointments,
    }
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>
}) {
    const params = await searchParams
    const period = (params.period as 'today' | 'week' | 'month') || 'today'

    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        redirect('/login')
    }

    const {
        appointmentsCount,
        totalClients,
        projectedRevenue,
        upcomingAppointments,
    } = await getDashboardData({ period, empresaId: session.user.empresaId })

    const periodLabels = {
        today: "hoje",
        week: "nesta semana",
        month: "neste mês"
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <DashboardDateFilter />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Agendamentos
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {period === 'today' ? "Para o dia de hoje" : `Total ${periodLabels[period]}`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clientes Totais
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-xs text-muted-foreground">
                            Cadastrados na base
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Faturamento (Proj.)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {projectedRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {period === 'today' ? "Estimado para hoje" : `Total ${periodLabels[period]}`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <UpcomingAppointments appointments={upcomingAppointments} />
                </div>
                <div className="space-y-4">
                    <DashboardCalendar />
                </div>
            </div>
        </div>
    )
}
