import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardAvailableSlotsProps {
    date: Date
    empresaId: string
}

export async function DashboardAvailableSlots({ date, empresaId }: DashboardAvailableSlotsProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    // Get all appointments for today
    const agendamentos = await db.agendamento.findMany({
        where: {
            empresaId,
            data: { gte: startOfDay, lt: endOfDay },
            status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] }
        },
        select: {
            data: true,
            agendamento_itens: { select: { duracao: true } }
        }
    })

    // Create standard slots from 09:00 to 19:00, every 30 minutes
    const availableSlots = []
    for (let hour = 9; hour < 19; hour++) {
        for (const min of [0, 30]) {
            const slotTime = new Date(Date.UTC(year, month, day, hour + 3, min, 0)) // Adjust timezone visually
            
            // Check if slot overlaps with any appointment
            const isBooked = agendamentos.some(apt => {
                const aptStart = new Date(apt.data)
                // Use a default duration of 30 if not provided
                const duration = apt.agendamento_itens[0]?.duracao || 30
                const aptEnd = new Date(aptStart.getTime() + duration * 60000)

                return slotTime >= aptStart && slotTime < aptEnd
            })

            if (!isBooked) {
                // Ensure we format correctly based on local time
                const hourStr = hour.toString().padStart(2, '0')
                const minStr = min.toString().padStart(2, '0')
                availableSlots.push(`${hourStr}:${minStr}`)
            }
        }
    }

    // Limit to the first 9 available slots for UI reasons
    const displaySlots = availableSlots.slice(0, 9)

    return (
        <Card className="rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 p-5 border-b border-dashboard-border">
                <Clock className="h-4 w-4 text-dashboard-subtle" />
                <h2 className="font-heading text-[15px] font-semibold text-dashboard-foreground">Horários vagos hoje</h2>
            </div>
            
            <CardContent className="p-5">
                <div>
                    {displaySlots.length === 0 ? (
                        <div className="flex h-[150px] items-center justify-center text-center text-dashboard-muted">
                            <p className="text-sm font-medium">Agenda totalmente lotada!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {displaySlots.map((time) => (
                                <div key={time} className="flex items-center justify-center rounded-[6px] border border-dashboard-border bg-dashboard-surface-hover py-2 text-[13px] font-semibold text-dashboard-muted">
                                    {time}
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="mt-5 text-[12px] font-medium text-dashboard-subtle">
                        {availableSlots.length} horários disponíveis
                    </p>
                </div>

                <div className="pt-4 mt-auto">
                    <Button variant="outline" className="w-full h-10 border-dashboard-border bg-dashboard-surface-hover text-dashboard-muted hover:bg-dashboard-primary hover:text-dashboard-primary-foreground hover:border-dashboard-primary rounded-[8px] text-[13px] font-semibold transition-all group">
                        Preencher agenda
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
