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
    totalCommissions: number
    dailyRevenue: {
        name: string;
        receita: number;
        details: { name: string; value: number }[]
    }[]
    topServices: { name: string; count: number; revenue: number }[]
}

export async function getFinancialMetrics(startDate: Date, endDate: Date, empresaId: string, colaboradorId?: string): Promise<FinancialMetrics> {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId || session.user.empresaId !== empresaId) {
        throw new Error("Unauthorized")
    }

    const where: any = {
        empresaId,
        data: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
        },
        status: {
            in: ['CONCLUIDO']
        }
    }

    if (colaboradorId && colaboradorId !== 'all') {
        where.colaboradorId = colaboradorId
    }

    // 1. Fetch completed appointments in the date range
    const appointments = await db.agendamento.findMany({
        where,
        include: {
            servico: true,
            colaborador: {
                select: {
                    comissaoTipo: true,
                    comissaoValor: true
                }
            }
        }
    })

    // 2. Calculate aggregations
    let totalRevenue = 0
    let totalCommissions = 0
    let totalSales = appointments.length

    // Group by day for chart with details
    const dailyMap = new Map<string, { total: number; details: Map<string, number> }>()

    // Group by service for top list
    const serviceMap = new Map<string, { count: number; revenue: number }>()

    appointments.forEach(app => {
        // Use value from appointment if available, otherwise service price
        const value = app.valor ? Number(app.valor) : Number(app.servico.preco)
        const serviceName = app.servico.nome
        totalRevenue += value

        // Calculate commission
        if (app.colaborador) {
            if (app.colaborador.comissaoTipo === 'PORCENTAGEM' && app.colaborador.comissaoValor) {
                totalCommissions += (value * Number(app.colaborador.comissaoValor)) / 100
            } else if (app.colaborador.comissaoTipo === 'VALOR_FIXO' && app.colaborador.comissaoValor) {
                totalCommissions += Number(app.colaborador.comissaoValor)
            }
        }

        // Daily aggregation
        const dayKey = format(app.data, 'dd/MM')

        if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, { total: 0, details: new Map() })
        }

        const dayStats = dailyMap.get(dayKey)!
        dayStats.total += value

        const currentServiceTotal = dayStats.details.get(serviceName) || 0
        dayStats.details.set(serviceName, currentServiceTotal + value)


        // Service aggregation
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
        const dayStats = dailyMap.get(dayKey)

        const details = dayStats
            ? Array.from(dayStats.details.entries()).map(([name, value]) => ({ name, value }))
            : []

        return {
            name: dayKey,
            receita: dayStats?.total || 0,
            details: details.sort((a, b) => b.value - a.value)
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
        totalCommissions,
        dailyRevenue,
        topServices
    }
}

export async function getFinancialMovements(startDate: Date, endDate: Date, empresaId: string, colaboradorId?: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId || session.user.empresaId !== empresaId) {
        throw new Error("Unauthorized")
    }

    const where: any = {
        empresaId,
        data: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
        },
        status: {
            in: ['CONCLUIDO', 'PENDENTE']
        }
    }

    if (colaboradorId && colaboradorId !== 'all') {
        where.colaboradorId = colaboradorId
    }

    const movements = await db.agendamento.findMany({
        where,
        include: {
            cliente: {
                select: {
                    nome: true
                }
            },
            servico: {
                select: {
                    nome: true,
                    preco: true
                }
            },
            colaborador: {
                select: {
                    nome: true,
                    comissaoTipo: true,
                    comissaoValor: true
                }
            }
        },
        orderBy: {
            data: 'desc'
        }
    })

    return movements.map(movement => {
        const valor = movement.valor ? Number(movement.valor) : Number(movement.servico.preco)
        let comissao = 0

        if (movement.colaborador) {
            if (movement.colaborador.comissaoTipo === 'PORCENTAGEM' && movement.colaborador.comissaoValor) {
                comissao = (valor * Number(movement.colaborador.comissaoValor)) / 100
            } else if (movement.colaborador.comissaoTipo === 'VALOR_FIXO' && movement.colaborador.comissaoValor) {
                comissao = Number(movement.colaborador.comissaoValor)
            }
        }

        return {
            id: movement.id,
            data: movement.data,
            cliente: movement.cliente.nome,
            servico: movement.servico.nome,
            colaborador: movement.colaborador?.nome || 'N/A',
            comissao,
            valor,
            status: movement.status
        }
    })
}

export async function getCollaborators(empresaId: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId || session.user.empresaId !== empresaId) {
        throw new Error("Unauthorized")
    }

    return await db.colaborador.findMany({
        where: {
            empresaId
        },
        select: {
            id: true,
            nome: true
        },
        orderBy: {
            nome: 'asc'
        }
    })
}
