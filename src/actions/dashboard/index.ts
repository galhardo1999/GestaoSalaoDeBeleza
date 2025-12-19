"use server"

import { db } from "@/lib/db"
import { startOfMonth, endOfMonth, format } from "date-fns"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getMonthlyAppointmentCounts(year: number, month: number) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        return {}
    }
    const empresaId = session.user.empresaId

    // Mês é 0-indexado em JS Date, então usamos diretamente para o construtor Date
    const startDate = startOfMonth(new Date(year, month))
    const endDate = endOfMonth(new Date(year, month))

    const appointments = await db.agendamento.groupBy({
        by: ['data'],
        where: {
            data: {
                gte: startDate,
                lte: endDate
            },
            status: {
                not: 'CANCELADO'
            }
        },
        _count: {
            id: true
        }
    })

    // Transformar em objeto tipo Map: "YYYY-MM-DD" -> contagem
    // Nota: groupBy com Date geralmente retorna o timestamp exato completo.
    // Se agendamentos forem em horários diferentes, eles não agruparão por DIA automaticamente a menos que armazenados apenas como datas.
    // Como 'data' é DateTime, provavalmente obteremos contagens individuais por timestamp.
    // Deveríamos consultar tudo e agregar em JS ou usar uma query bruta para truncamento de data.
    // Dadas limitações do Prisma com truncamento de data, vamos buscar lista simplificada e reduzir.

    const allAppointments = await db.agendamento.findMany({
        where: {
            empresaId,
            data: {
                gte: startDate,
                lte: endDate
            },
            status: {
                not: 'CANCELADO'
            }
        },
        select: {
            data: true
        }
    })

    const counts: Record<string, number> = {}

    allAppointments.forEach(apt => {
        // Formatar para YYYY-MM-DD
        // Usamos split para garantir que não haja mudança de fuso se possível,
        // mas usar manipulação de string simples na string ISO ou date-fns é mais seguro com consciência de UTC.
        // Vamos assumir que o tempo do servidor é consistente.
        const dateKey = format(apt.data, 'yyyy-MM-dd')
        counts[dateKey] = (counts[dateKey] || 0) + 1
    })

    return counts
}
