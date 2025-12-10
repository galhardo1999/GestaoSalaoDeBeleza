import { db } from "@/lib/db"
import { FullCalendar } from "@/components/calendar/full-calendar"

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
    const agendamentos = await db.agendamento.findMany({
        include: {
            cliente: true,
            servico: true,
        }
    })

    const formattedAgendamentos = agendamentos.map(apt => ({
        ...apt,
        servico: {
            ...apt.servico,
            preco: Number(apt.servico.preco)
        }
    }))

    return (
        <div className="p-8 h-full">
            <FullCalendar agendamentos={formattedAgendamentos} />
        </div>
    )
}
