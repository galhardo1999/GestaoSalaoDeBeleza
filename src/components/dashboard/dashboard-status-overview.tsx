import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart2 } from "lucide-react"

interface DashboardStatusOverviewProps {
    date: Date
    empresaId: string
}

export async function DashboardStatusOverview({ date, empresaId }: DashboardStatusOverviewProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    // Count appointments by status
    const agendamentosPorStatus = await db.agendamento.groupBy({
        by: ['status'],
        where: {
            empresaId,
            data: {
                gte: startOfDay,
                lt: endOfDay
            }
        },
        _count: {
            id: true
        }
    })

    const totalAgendamentos = agendamentosPorStatus.reduce((acc, curr) => acc + curr._count.id, 0)

    const statusCounts = {
        AGENDADO: 0,
        CONCLUIDO: 0,
        PENDENTE: 0,
        CANCELADO: 0,
        NAO_COMPARECEU: 0,
    }

    agendamentosPorStatus.forEach(item => {
        statusCounts[item.status as keyof typeof statusCounts] = item._count.id
    })

    const statusConfig = [
        { key: 'AGENDADO', label: 'Agendado', count: statusCounts.AGENDADO, color: 'bg-[#3B82F6]' },
        { key: 'CONCLUIDO', label: 'Concluído', count: statusCounts.CONCLUIDO, color: 'bg-[#4ADE80]' },
        { key: 'PENDENTE', label: 'Pendente', count: statusCounts.PENDENTE, color: 'bg-[#F59E0B]' },
        { key: 'CANCELADO', label: 'Cancelado', count: statusCounts.CANCELADO, color: 'bg-[#EF4444]' },
        { key: 'NAO_COMPARECEU', label: 'Não compareceu', count: statusCounts.NAO_COMPARECEU, color: 'bg-[#71685F]' },
    ]

    return (
        <Card className="rounded-[10px] border-[#2A2418] bg-[#111111] py-0 shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 p-5 border-b border-[#2A2418]">
                <BarChart2 className="h-4 w-4 text-[#71685F]" />
                <h2 className="font-heading text-[15px] font-semibold text-[#F5F0E8]">Status dos agendamentos hoje</h2>
            </div>
            
            <CardContent className="p-5 space-y-4">
                {statusConfig.map(({ key, label, count, color }) => {
                    const percentage = totalAgendamentos > 0 ? (count / totalAgendamentos) * 100 : 0
                    
                    return (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-[120px]">
                                <div className={`h-2 w-2 rounded-full ${color}`} />
                                <span className="text-[13px] font-semibold text-[#F5F0E8]">{label}</span>
                            </div>
                            
                            <div className="flex-1">
                                <div className="h-1.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${color}`} 
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>

                            <div className="min-w-[24px] text-right font-heading text-[15px] font-bold text-[#F5F0E8]">
                                {count}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
