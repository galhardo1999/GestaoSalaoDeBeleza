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
                    servicos: { select: { nome: true, duracaoMin: true } }
                }
            },
            colaborador: { select: { nome: true } }
        }
    })

    // Format for the client component
    const formattedAppointments = upcomingAppointments.map(apt => {
        const totalDuration = apt.agendamento_itens.reduce((sum, item) => sum + (item.duracao || item.servicos.duracaoMin || 30), 0)
        return {
            id: apt.id,
            data: apt.data,
            status: apt.status,
            cliente: apt.cliente,
            servico: apt.agendamento_itens[0]?.servicos || { nome: 'Serviço' },
            colaborador: apt.colaborador,
            duracaoMin: totalDuration
        }
    })

    return <UpcomingAppointments appointments={formattedAppointments} date={date} />
}

export function DashboardUpcomingSkeleton() {
    return (
        <Card className="bg-[#111111] border-[#2A2418] shadow-[0_18px_50px_rgba(0,0,0,0.30)] h-[400px] p-6 rounded-[10px]">
            <div className="flex justify-between items-center mb-6 border-b border-[#2A2418] pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-[#2A2418] rounded animate-pulse" />
                    <div className="h-4 w-32 bg-[#2A2418] rounded animate-pulse" />
                </div>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full bg-[#1B1B1B] rounded-[8px] animate-pulse" />
                ))}
            </div>
        </Card>
    )
}
