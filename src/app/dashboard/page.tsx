import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign } from "lucide-react"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"

import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

interface DashboardDataParams {
    date: string
    empresaId: string
}

async function getDashboardData({ date, empresaId }: DashboardDataParams) {
    // Parse the date string YYYY-MM-DD
    // Create start and end of that specific day in UTC relative to Brazil logic
    // We treat the inputs as "User wants to see data for this calendar day"

    // Construct the specific day boundaries
    // Start: date T 00:00:00.000 Local -> converted to UTC
    // Since we are dealing with a date string, we can just assume 03:00 UTC for Brazil start if simple
    // Or just use the string to create the Date object.

    const [year, month, day] = date.split('-').map(Number)
    // Create date at 00:00 local time (approx) or just force the UTC hours
    // Brazil is UTC-3. So 00:00 BRT is 03:00 UTC.
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 26, 59, 59)) // 02:59:59 next day UTC

    const appointmentsCount = await db.agendamento.count({
        where: {
            empresaId,
            data: {
                gte: startOfDay,
                lt: endOfDay,
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
                gte: startOfDay,
                lt: endOfDay,
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

    const upcomingAppointments = await db.agendamento.findMany({
        where: {
            empresaId,
            data: {
                gte: startOfDay,
                lt: endOfDay
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
    searchParams: Promise<{ date?: string }>
}) {
    const params = await searchParams
    const dateParam = params.date
    const now = new Date()

    // Default to today if no date provided
    let targetDate = now
    if (dateParam) {
        const [y, m, d] = dateParam.split('-').map(Number)
        targetDate = new Date(y, m - 1, d)
    }

    // Format date string for API: YYYY-MM-DD
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`

    // Format for display: 16 de Dezembro de 2025
    const displayDate = targetDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        redirect('/login')
    }

    const firstName = session.user.name?.split(' ')[0] || 'Usuário'

    const {
        appointmentsCount,
        totalClients,
        projectedRevenue,
        upcomingAppointments,
    } = await getDashboardData({ date: dateStr, empresaId: session.user.empresaId })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bem Vindo, {firstName}!✨</h2>
                    <p className="text-muted-foreground capitalize">{displayDate}</p>
                </div>
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
                            Para este dia
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
                            Estimado para este dia
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <UpcomingAppointments appointments={upcomingAppointments} date={targetDate} />
                </div>
                <div className="space-y-4">
                    <DashboardCalendar />
                </div>
            </div>
        </div>
    )
}
