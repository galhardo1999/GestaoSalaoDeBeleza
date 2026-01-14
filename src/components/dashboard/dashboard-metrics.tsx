
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign } from "lucide-react"

interface DashboardMetricsProps {
    date: Date
    empresaId: string
}

export async function DashboardMetrics({ date, empresaId }: DashboardMetricsProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    // Create date boundaries in UTC approx for the day
    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    // Fetch active collaborators and their status
    const now = new Date()
    const activeCollaborators = await db.colaborador.findMany({
        where: { empresaId },
        include: {
            agendamentos: {
                where: {
                    data: {
                        gte: new Date(now.setHours(0, 0, 0, 0)),
                        lt: new Date(now.setHours(23, 59, 59, 999))
                    },
                    status: {
                        notIn: ['CANCELADO', 'NAO_COMPARECEU']
                    }
                },
                include: {
                    agendamento_itens: true
                }
            }
        }
    })

    const currentTimeKey = new Date()

    const availableCollaboratorsCount = activeCollaborators.filter(colaborador => {
        const currentAppointment = colaborador.agendamentos.find(apt => {
            const start = new Date(apt.data)
            // Calculate total duration from all items, or use default 30 min
            const totalDuration = apt.agendamento_itens.reduce((sum, item) => sum + item.duracao, 0) || 30
            const end = new Date(start.getTime() + totalDuration * 60000)
            return currentTimeKey >= start && currentTimeKey <= end
        })
        return !currentAppointment
    }).length


    const [appointmentsCount, totalClients] = await Promise.all([
        db.agendamento.count({
            where: {
                empresaId,
                data: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        }),
        db.cliente.count({
            where: { empresaId }
        })
    ])

    return (
        <>
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
                        Profissionais Disponíveis
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{availableCollaboratorsCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Livres agora
                    </p>
                </CardContent>
            </Card>
        </>
    )
}

export function DashboardMetricsSkeleton() {
    return (
        <>
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
