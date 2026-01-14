
import { db } from "@/lib/db"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { Card } from "@/components/ui/card"

interface DashboardUpcomingProps {
    date: Date
    empresaId: string
}

export async function DashboardUpcoming({ date, empresaId }: DashboardUpcomingProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    const upcomingAppointments = await db.agendamento.findMany({
        where: {
            empresaId,
            status: {
                not: 'CANCELADO' as any
            },
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
            agendamento_itens: {
                include: {
                    servicos: { select: { nome: true } }
                }
            },
            colaborador: { select: { nome: true } }
        }
    })

    // Format for the client component
    const formattedAppointments = upcomingAppointments.map(apt => ({
        id: apt.id,
        data: apt.data,
        status: apt.status,
        cliente: apt.cliente,
        servico: apt.agendamento_itens[0]?.servicos || { nome: 'Serviço' },
        colaborador: apt.colaborador
    }))

    return <UpcomingAppointments appointments={formattedAppointments} date={date} />
}

export function DashboardUpcomingSkeleton() {
    return (
        <Card className="bg-white shadow-sm border-border h-[400px] p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 w-full bg-gray-50 rounded-xl animate-pulse" />
                ))}
            </div>
        </Card>
    )
}
