import { db } from "@/lib/db"
import { CalendarView } from "@/components/dashboard/calendar-view"

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
    const [agendamentos, clientes, servicos, colaboradores] = await Promise.all([
        db.agendamento.findMany({
            include: {
                cliente: true,
                servico: true,
                colaborador: true,
            }
        }),
        db.cliente.findMany({
            orderBy: { nome: 'asc' }
        }),
        db.servico.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' }
        }),
        db.colaborador.findMany({
            orderBy: { nome: 'asc' }
        })
    ])

    const formattedServicos = servicos.map(s => ({
        ...s,
        preco: Number(s.preco)
    }))

    // Transform Decimal to Number if needed, but for View we prioritize matching the interface
    // The interface expects servico { nome, duracaoMin }. Extra fields are ignored or fine.
    // We just pass it directly if types align, or map if needed.
    // Prisma Decimal is not compatible with number usually, but we don't use price in the view yet.
    // However, to be safe and clean:
    const formattedAgendamentos = agendamentos.map(apt => ({
        ...apt,
        status: apt.status.toString(), // Ensure enum is string
        servico: {
            ...apt.servico,
            preco: Number(apt.servico.preco)
        }
    }))

    return (
        <div className="p-8 h-full">
            <CalendarView
                agendamentos={formattedAgendamentos}
                clientes={clientes}
                servicos={formattedServicos}
                colaboradores={colaboradores}
            />
        </div>
    )
}
