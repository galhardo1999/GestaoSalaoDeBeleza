import { db } from "@/lib/db"
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
    const now = new Date()
    let startDate = startOfDay(now)
    let endDate = endOfDay(now)

    if (period === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 0 }) // Sunday start
        endDate = endOfWeek(now, { weekStartsOn: 0 })
    } else if (period === 'month') {
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const appointmentsCount = await db.agendamento.count({
        where: {
            data: {
                gte: startDate,
                lte: endDate,
            },
        },
    })

    const totalClients = await db.cliente.count()

    const revenueAppointments = await db.agendamento.findMany({
        where: {
            data: {
                gte: startDate,
                lte: endDate,
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

    // Agenda de Hoje (Today's appointments)
    const todayStart = startOfDay(new Date())
    const todayEnd = endOfDay(new Date())

    const upcomingAppointments = await db.agendamento.findMany({
        where: {
            data: {
                gte: todayStart,
                lte: todayEnd
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
