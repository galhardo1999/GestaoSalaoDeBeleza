import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign } from "lucide-react"

async function getDashboardData() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const appointmentsToday = await db.agendamento.count({
        where: {
            data: {
                gte: today,
                lt: tomorrow,
            },
        },
    })

    const totalClients = await db.cliente.count()

    const revenueAppointments = await db.agendamento.findMany({
        where: {
            data: {
                gte: today,
                lt: tomorrow,
            },
            // Assume revenue comes from all NON-CANCELLED appointments for projection, or just COMPLETED for actual.
            // For dashboard "Projection", let's use all SCHEUDLED + COMPLETED
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

    return {
        appointmentsToday,
        totalClients,
        projectedRevenue
    }
}

export default async function DashboardPage() {
    const { appointmentsToday, totalClients, projectedRevenue } = await getDashboardData()

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Agendamentos Hoje
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentsToday}</div>
                        <p className="text-xs text-muted-foreground">
                            Para o dia de hoje
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
                            Estimado para hoje
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
