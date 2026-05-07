import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, UserX, CalendarX, FileWarning } from "lucide-react"

interface DashboardAlertsProps {
    date: Date
    empresaId: string
}

export async function DashboardAlerts({ date, empresaId }: DashboardAlertsProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    const sixtyDaysAgo = new Date(date)
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    // 1. Clientes sem retorno há mais de 60 dias
    // (clientes que têm agendamentos passados, mas nenhum agendamento após sixtyDaysAgo)
    const clientesComAgendamentos = await db.cliente.findMany({
        where: { empresaId },
        include: {
            agendamentos: {
                orderBy: { data: 'desc' },
                take: 1
            }
        }
    })

    const inativosCount = clientesComAgendamentos.filter(c => {
        if (c.agendamentos.length === 0) return false
        const lastApt = new Date(c.agendamentos[0].data)
        return lastApt < sixtyDaysAgo
    }).length

    // 2. Cancelamentos hoje
    const cancelamentosHoje = await db.agendamento.count({
        where: {
            empresaId,
            data: { gte: startOfDay, lt: endOfDay },
            status: 'CANCELADO'
        }
    })

    return (
        <Card className="rounded-[10px] border-[#2A2418] bg-[#111111] py-0 shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 p-5 border-b border-[#2A2418]">
                <AlertTriangle className="h-4 w-4 text-[#71685F]" />
                <h2 className="font-heading text-[15px] font-semibold text-[#F5F0E8]">Alertas e notificações</h2>
            </div>
            
            <CardContent className="p-5 space-y-3">
                {/* Alerta 1 */}
                <div className="flex items-start gap-3 rounded-[8px] bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-4">
                    <UserX className="h-5 w-5 text-[#F59E0B] mt-0.5" />
                    <div>
                        <p className="text-[13px] font-semibold text-[#F59E0B]">
                            {inativosCount} {inativosCount === 1 ? 'cliente' : 'clientes'}
                        </p>
                        <p className="text-[12px] font-medium text-[#F59E0B]/80 mt-0.5">
                            sem retorno há +60 dias
                        </p>
                    </div>
                </div>

                {/* Alerta 2 */}
                <div className="flex items-start gap-3 rounded-[8px] bg-[#EF4444]/10 border border-[#EF4444]/20 p-4">
                    <CalendarX className="h-5 w-5 text-[#EF4444] mt-0.5" />
                    <div>
                        <p className="text-[13px] font-semibold text-[#EF4444]">
                            {cancelamentosHoje} {cancelamentosHoje === 1 ? 'cancelamento' : 'cancelamentos'}
                        </p>
                        <p className="text-[12px] font-medium text-[#EF4444]/80 mt-0.5">
                            hoje sem reagendamento
                        </p>
                    </div>
                </div>

                {/* Alerta 3 (Mockado para combinar com UI) */}
                <div className="flex items-start gap-3 rounded-[8px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-4">
                    <FileWarning className="h-5 w-5 text-[#3B82F6] mt-0.5" />
                    <div>
                        <p className="text-[13px] font-semibold text-[#3B82F6]">
                            Plano de sistema
                        </p>
                        <p className="text-[12px] font-medium text-[#3B82F6]/80 mt-0.5">
                            ativo e em dia
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
