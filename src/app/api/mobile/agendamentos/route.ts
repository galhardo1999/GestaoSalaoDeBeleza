import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresaId')
    const dateParam = searchParams.get('date')

    if (!empresaId) {
        return NextResponse.json({ success: false, error: "Empresa ID é obrigatório" }, { status: 400 })
    }

    try {
        const whereClause: any = {
            empresaId: empresaId,
        }

        if (dateParam) {
            // dateParam is YYYY-MM-DD
            // Create range for that day in local time
            // Appending T00:00:00 ensures local time parsing in most environments or use split
            const parts = dateParam.split('-')
            const year = parseInt(parts[0])
            const month = parseInt(parts[1]) - 1
            const day = parseInt(parts[2])

            const startOfDay = new Date(year, month, day, 0, 0, 0, 0)
            const endOfDay = new Date(year, month, day, 23, 59, 59, 999)

            whereClause.data = {
                gte: startOfDay,
                lte: endOfDay
            }
        }

        // Fetch upcoming appointments
        // Assuming Agendamento model has data, servico, cliente, colaborador relations
        // Based on schema viewed earlier
        const agendamentos = await db.agendamento.findMany({
            where: whereClause,
            orderBy: {
                data: 'desc' // Show newest first or nearest? Usually nearest future. Let's do desc for now (latest added/dates)
            },
            take: 20,
            include: {
                servico: {
                    select: { nome: true }
                },
                cliente: {
                    select: { nome: true }
                },
                colaborador: {
                    select: { nome: true }
                }
            }
        })

        const formatted = agendamentos.map(a => ({
            id: a.id,
            service: a.servico.nome,
            date: a.data.toLocaleDateString('pt-BR'),
            time: a.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: a.status,
            client: a.cliente.nome,
            professional: a.colaborador?.nome || 'N/A'
        }))

        return NextResponse.json({
            success: true,
            data: formatted
        })
    } catch (error) {
        console.error("Error fetching appointments:", error)
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}
