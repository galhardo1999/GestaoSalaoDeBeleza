import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign } from "lucide-react"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { TopServices } from "@/components/dashboard/top-services"
import { TopCollaborators } from "@/components/dashboard/top-collaborators"
import { DashboardDateFilter } from "@/components/dashboard/dashboard-date-filter"
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

    // Upcoming Appointments (always from NOW onwards, active)
    const upcomingAppointments = await db.agendamento.findMany({
        where: {
            data: {
                gte: new Date(),
            },
            status: 'AGENDADO'
        },
        orderBy: {
            data: 'asc'
        },
        take: 5,
        include: {
            cliente: { select: { nome: true } },
            servico: { select: { nome: true } }
        }
    })

    // Top Services (Filtered by period)
    const topServicesGrouped = await db.agendamento.groupBy({
        by: ['servicoId'],
        _count: {
            servicoId: true
        },
        where: {
            data: {
                gte: startDate,
                lte: endDate,
            },
            status: 'CONCLUIDO' // Only count completed for "Top Services" usually? Or all? Let's use all for now as per previous logic, but maybe better to filter by period.
        },
        orderBy: {
            _count: {
                servicoId: 'desc'
            }
        },
        take: 5
    })

    const topServices = await Promise.all(topServicesGrouped.map(async (item) => {
        const service = await db.servico.findUnique({
            where: { id: item.servicoId }
        })
        return {
            serviceName: service?.nome || 'Desconhecido',
            count: item._count.servicoId
        }
    }))

    // Top Collaborators (Filtered by period)
    const topCollaboratorsGrouped = await db.agendamento.groupBy({
        by: ['colaboradorId'],
        _count: {
            colaboradorId: true
        },
        where: {
            data: {
                gte: startDate,
                lte: endDate,
            },
            colaboradorId: { not: null },
            status: 'CONCLUIDO'
        },
        orderBy: {
            _count: {
                colaboradorId: 'desc'
            }
        },
        take: 5
    })

    const topCollaborators = await Promise.all(topCollaboratorsGrouped.map(async (item) => {
        if (!item.colaboradorId) return null
        const colab = await db.colaborador.findUnique({
            where: { id: item.colaboradorId }
        })
        return {
            name: colab?.nome || 'Desconhecido',
            count: item._count.colaboradorId
        }
    }))

    return {
        appointmentsCount,
        totalClients,
        projectedRevenue,
        upcomingAppointments,
        topServices,
        topCollaborators: topCollaborators.filter(c => c !== null) as { name: string, count: number }[]
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
        topServices,
        topCollaborators
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
                    <TopServices services={topServices} />
                    <TopCollaborators collaborators={topCollaborators} />
                </div>
            </div>
        </div>
    )
}
