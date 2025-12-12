import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign } from "lucide-react"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { DashboardDateFilter } from "@/components/dashboard/dashboard-date-filter"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

interface DashboardDataParams {
    period: 'today' | 'week' | 'month'
}

async function getDashboardData({ period }: DashboardDataParams) {
    // Force Brazil Timezone for "Today"
    // In Brazil, today started at T03:00:00Z (which is 00:00 BRT) if we are talking about UTC representation of BRT day start?
    // Actually simpler: Create a date string for Brazil, parse it.

    // helper to get Brazil Date object calculated correctly
    const now = new Date()
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

    // For start/end of day, we want the ranges that correspond to Brazil's day.
    // E.g. Today 00:00 BRT is Today 03:00 UTC. Today 23:59 BRT is Tomorrow 02:59 UTC.
    // Let's use string manipulation to be safe and clear.

    let startDate: Date
    let endDate: Date

    if (period === 'today') {
        const todayStr = brazilNow.toISOString().split('T')[0]
        startDate = new Date(`${todayStr}T03:00:00Z`)
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
    } else if (period === 'week') {
        const start = startOfWeek(brazilNow, { weekStartsOn: 0 })
        const end = endOfWeek(brazilNow, { weekStartsOn: 0 })
        // These are local time of the server (UTC) constructed from brazilNow values. 
        // We need to shift them to match Prisma's UTC expectation for BRT.
        // Actually, let's keep it simple. If we use the Date objects from date-fns on 'brazilNow', 
        // they represent the correct "time values" but in UTC. 
        // e.g. brazilNow is 16:00. startOfWeek(brazilNow) is Sunday 00:00. 
        // But Sunday 00:00 in valid absolute time meant for Brazil is Sunday 03:00 UTC.
        // If we just use startOfWeek(brazilNow), we get Sunday 00:00 UTC, which is Saturday 21:00 BRT.
        // Good enough approximation? Maybe. But "Today" is critical.
        // Let's stick to the precise "Today" logic for the 'today' period as it's the requested one. 
        // For Week/Month, maybe acceptable to have slight offset or fix properly.
        // Let's fix properly using offset.

        // 3 hours in ms
        const offset = 3 * 60 * 60 * 1000
        startDate = new Date(startOfWeek(brazilNow, { weekStartsOn: 0 }).getTime() + offset)
        endDate = new Date(endOfWeek(brazilNow, { weekStartsOn: 0 }).getTime() + offset)

    } else { // month
        const offset = 3 * 60 * 60 * 1000
        startDate = new Date(startOfMonth(brazilNow).getTime() + offset)
        endDate = new Date(endOfMonth(brazilNow).getTime() + offset)
    }

    const appointmentsCount = await db.agendamento.count({
        where: {
            data: {
                gte: startDate,
                lt: endDate, // Changed to lt for strict boundary
            },
        },
    })

    const totalClients = await db.cliente.count()

    const revenueAppointments = await db.agendamento.findMany({
        where: {
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

    // Agenda de Hoje (Today's appointments) - Always today regardless of period param?
    // "Agenda de Hoje" implies Today.
    const todayStr = brazilNow.toISOString().split('T')[0]
    const todayStart = new Date(`${todayStr}T03:00:00Z`)
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const upcomingAppointments = await db.agendamento.findMany({
        where: {
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
    const {
        appointmentsCount,
        totalClients,
        projectedRevenue,
        upcomingAppointments,
    } = await getDashboardData({ period })

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
