"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FinancialMetrics {
    totalRevenue: number
    totalSales: number
    averageTicket: number
    dailyRevenue: { name: string; receita: number }[]
    topServices: { name: string; count: number; revenue: number }[]
}

export async function getFinancialMetrics(startDate: Date, endDate: Date, empresaId: string): Promise<FinancialMetrics> {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId || session.user.empresaId !== empresaId) {
        throw new Error("Unauthorized")
    }

    // 1. Fetch completed appointments in the date range
    const appointments = await db.agendamento.findMany({
        where: {
            empresaId,
            data: {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate)
            },
            status: {
                in: ['CONCLUIDO']
            }
        },
        include: {
            servico: true
        }
    })

    // 2. Calculate aggregations
    let totalRevenue = 0
    let totalSales = appointments.length
    
    // Group by day for chart
    const dailyMap = new Map<string, number>()
    
    // Group by service for top list
    const serviceMap = new Map<string, { count: number; revenue: number }>()

    appointments.forEach(app => {
        // Use value from appointment if available, otherwise service price
        const value = app.valor ? Number(app.valor) : Number(app.servico.preco)
        totalRevenue += value

        // Daily aggregation
        // Make sure to format current date properly
        const dayKey = format(app.data, 'dd/MM')
        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + value)

        // Service aggregation
        const serviceName = app.servico.nome
        const currentService = serviceMap.get(serviceName) || { count: 0, revenue: 0 }
        serviceMap.set(serviceName, {
            count: currentService.count + 1,
            revenue: currentService.revenue + value
        })
    })

    // 3. Fill missing days with 0 for the chart
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate })
    const dailyRevenue = daysInterval.map(day => {
        const dayKey = format(day, 'dd/MM')
        return {
            name: dayKey,
            receita: dailyMap.get(dayKey) || 0
        }
    })

    // 4. Format top services
    const topServices = Array.from(serviceMap.entries())
        .map(([name, stats]) => ({
            name,
            count: stats.count,
            revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5) // Top 5

    return {
        totalRevenue,
        totalSales,
        averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
        dailyRevenue,
        topServices
    }
}
