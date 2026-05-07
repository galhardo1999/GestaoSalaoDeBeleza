import { db } from "@/lib/db"
import { verificarTokenMobile } from "@/lib/seguranca"
import { NextResponse } from "next/server"
import { z } from "zod"

const consultaAgendamentosSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const criarIntervaloDia = (data: string) => {
    const [ano, mes, dia] = data.split("-").map(Number)

    return {
        inicio: new Date(ano, mes - 1, dia, 0, 0, 0, 0),
        fim: new Date(ano, mes - 1, dia, 23, 59, 59, 999),
    }
}

export async function GET(req: Request) {
    const token = verificarTokenMobile(req.headers)

    if (!token) {
        return NextResponse.json({ success: false, error: "Nao autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const parsed = consultaAgendamentosSchema.safeParse({
        date: searchParams.get("date") ?? undefined,
    })

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: "Dados invalidos", details: parsed.error.flatten() },
            { status: 400 },
        )
    }

    try {
        const intervalo = parsed.data.date ? criarIntervaloDia(parsed.data.date) : null

        const agendamentos = await db.agendamento.findMany({
            where: {
                empresaId: token.empresaId,
                ...(intervalo
                    ? {
                        data: {
                            gte: intervalo.inicio,
                            lte: intervalo.fim,
                        },
                    }
                    : {}),
            },
            orderBy: {
                data: "desc",
            },
            take: 20,
            select: {
                id: true,
                data: true,
                status: true,
                agendamento_itens: {
                    take: 1,
                    select: {
                        servicos: {
                            select: { nome: true },
                        },
                    },
                },
                cliente: {
                    select: { nome: true },
                },
                colaborador: {
                    select: { nome: true },
                },
            },
        })

        const agendamentosFormatados = agendamentos.map((agendamento) => ({
            id: agendamento.id,
            service: agendamento.agendamento_itens[0]?.servicos?.nome || "Servico",
            date: agendamento.data.toLocaleDateString("pt-BR"),
            time: agendamento.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            status: agendamento.status,
            client: agendamento.cliente.nome,
            professional: agendamento.colaborador?.nome || "N/A",
        }))

        return NextResponse.json({
            success: true,
            data: agendamentosFormatados,
        })
    } catch (erro) {
        console.error("Erro ao buscar agendamentos mobile:", erro)
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}
