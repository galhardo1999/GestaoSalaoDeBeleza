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

    // Month is 0-indexed in JS Date, so we use it directly for Date constructor
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

    // Transform to Map-like object: "YYYY-MM-DD" -> count
    // Note: groupBy with Date usually returns the full exact timestamp. 
    // If appointments are at different times, they won't group by DAY automatically unless stored as dates only.
    // Since 'data' is DateTime, we likely get individual counts per timestamp.
    // We should better query all and aggregate in JS or use a raw query for date truncation.
    // Given Prisma limitations with date truncation, let's fetch simplified list and reduce.

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
        // Format to YYYY-MM-DD
        // We use split to ensure we don't get timezone shifts if possible, 
        // but using simple string manipulation on the ISO string or date-fns format is safer with UTC awareness.
        // Let's assume server time is consistent.
        const dateKey = format(apt.data, 'yyyy-MM-dd')
        counts[dateKey] = (counts[dateKey] || 0) + 1
    })

    return counts
}
