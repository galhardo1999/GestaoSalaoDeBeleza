"use server"

import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns"
import { ptBR } from "date-fns/locale"

// P2: Extracted commission calculation - DRY/SRP principle
interface CommissionParams {
    type: 'PORCENTAGEM' | 'VALOR_FIXO' | null
    rate: number | null
    value: number
}

function calculateCommission({ type, rate, value }: CommissionParams): number {
    if (!type || !rate) return 0
    return type === 'PORCENTAGEM' ? (value * rate) / 100 : rate
}

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
    topCollaborators: { name: string; image: string | null; count: number }[]
}

export async function getFinancialMetrics(startDate: Date, endDate: Date, empresaId: string, colaboradorId?: string): Promise<FinancialMetrics> {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId || session.user.empresaId !== empresaId) {
        throw new Error("Unauthorized")
    }

    // P1: Proper Prisma typing instead of 'any'
    const where: Prisma.AgendamentoWhereInput = {
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
                    nome: true,
                    foto: true,
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

    // Group by collaborator for top list
    const collaboratorMap = new Map<string, { name: string; image: string | null; count: number }>()

    appointments.forEach(app => {
        // Use value from appointment if available, otherwise service price
        const value = app.valor ? Number(app.valor) : Number(app.servico.preco)
        const serviceName = app.servico.nome
        totalRevenue += value

        // P2: Using extracted commission calculation helper
        if (app.colaborador) {
            totalCommissions += calculateCommission({
                type: app.colaborador.comissaoTipo as 'PORCENTAGEM' | 'VALOR_FIXO' | null,
                rate: app.colaborador.comissaoValor ? Number(app.colaborador.comissaoValor) : null,
                value
            })
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
        // Service aggregation
        const currentService = serviceMap.get(serviceName) || { count: 0, revenue: 0 }
        serviceMap.set(serviceName, {
            count: currentService.count + 1,
            revenue: currentService.revenue + value
        })

        // Collaborator aggregation
        if (app.colaborador) {
            const colName = app.colaborador.nome
            const currentCol = collaboratorMap.get(colName) || { name: colName, image: app.colaborador.foto, count: 0 }
            collaboratorMap.set(colName, {
                ...currentCol,
                count: currentCol.count + 1
            })
        }
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

    // 5. Format top collaborators
    const topCollaborators = Array.from(collaboratorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return {
        totalRevenue,
        totalSales,
        averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
        totalCommissions,
        dailyRevenue,
        topServices,
        topCollaborators
    }
}

export async function getFinancialMovements(startDate: Date, endDate: Date, empresaId: string, colaboradorId?: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId || session.user.empresaId !== empresaId) {
        throw new Error("Unauthorized")
    }

    // P1: Proper Prisma typing instead of 'any'
    const where: Prisma.AgendamentoWhereInput = {
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
                    foto: true,
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
        // P2: Using extracted commission calculation helper
        const comissao = movement.colaborador
            ? calculateCommission({
                type: movement.colaborador.comissaoTipo as 'PORCENTAGEM' | 'VALOR_FIXO' | null,
                rate: movement.colaborador.comissaoValor ? Number(movement.colaborador.comissaoValor) : null,
                value: valor
            })
            : 0

        return {
            id: movement.id,
            data: movement.data,
            cliente: movement.cliente.nome,
            servico: movement.servico.nome,
            colaborador: {
                name: movement.colaborador?.nome || 'N/A',
                image: movement.colaborador?.foto || null
            },
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
