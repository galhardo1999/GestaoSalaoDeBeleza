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
        where.OR = [
            { colaboradorId: colaboradorId },
            { agendamento_itens: { some: { colaborador_id: colaboradorId } } }
        ]
    }

    // 1. Fetch completed appointments in the date range
    const appointments = await db.agendamento.findMany({
        where,
        include: {
            agendamento_itens: {
                include: {
                    servicos: {
                        select: {
                            nome: true,
                            preco: true
                        }
                    },
                    colaboradores: {
                        select: {
                            id: true,
                            nome: true,
                            foto: true,
                            comissaoTipo: true,
                            comissaoValor: true
                        }
                    }
                }
            },
            colaborador: {
                select: {
                    id: true,
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
    let totalSales = 0 // Count of matched appointments (visits)

    // Group by day for chart with details
    const dailyMap = new Map<string, { total: number; details: Map<string, number> }>()

    // Group by service for top list
    const serviceMap = new Map<string, { count: number; revenue: number }>()

    // Group by collaborator for top list
    const collaboratorMap = new Map<string, { name: string; image: string | null; count: number }>()

    appointments.forEach(app => {
        let hasMatch = false
        const dayKey = format(app.data, 'dd/MM')

        // Helper to update daily stats
        const addToDaily = (name: string, value: number) => {
            if (!dailyMap.has(dayKey)) dailyMap.set(dayKey, { total: 0, details: new Map() })
            const stats = dailyMap.get(dayKey)!
            stats.total += value
            const current = stats.details.get(name) || 0
            stats.details.set(name, current + value)
        }

        // Helper to update service stats
        const addToService = (name: string, value: number) => {
            const current = serviceMap.get(name) || { count: 0, revenue: 0 }
            serviceMap.set(name, { count: current.count + 1, revenue: current.revenue + value })
        }

        // Helper to update collaborator stats
        const addToCollab = (id: string, name: string, image: string | null) => {
            const current = collaboratorMap.get(name) || { name, image, count: 0 }
            collaboratorMap.set(name, { ...current, count: current.count + 1 })
        }

        // Logic split: Multi-item vs Legacy
        if (app.agendamento_itens.length > 0) {
            app.agendamento_itens.forEach(item => {
                const colab = item.colaboradores

                // Filter check
                if (colaboradorId && colaboradorId !== 'all' && colab?.id !== colaboradorId) {
                    return // Skip this item
                }

                hasMatch = true
                const itemValor = Number(item.preco)

                totalRevenue += itemValor

                if (colab) {
                    totalCommissions += calculateCommission({
                        type: colab.comissaoTipo as 'PORCENTAGEM' | 'VALOR_FIXO' | null,
                        rate: colab.comissaoValor ? Number(colab.comissaoValor) : null,
                        value: itemValor
                    })
                    if (colab.nome) addToCollab(colab.id, colab.nome, colab.foto)
                }

                if (item.servicos?.nome) {
                    addToService(item.servicos.nome, itemValor)
                    addToDaily(item.servicos.nome, itemValor)
                }
            })
        } else {
            // Legacy Fallback
            if (colaboradorId && colaboradorId !== 'all' && app.colaborador?.id !== colaboradorId) {
                return // Skip appointment
            }

            hasMatch = true
            const valor = app.valor ? Number(app.valor) : 0
            totalRevenue += valor
            const serviceName = 'Serviço (Legado)'

            if (app.colaborador) {
                totalCommissions += calculateCommission({
                    type: app.colaborador.comissaoTipo as 'PORCENTAGEM' | 'VALOR_FIXO' | null,
                    rate: app.colaborador.comissaoValor ? Number(app.colaborador.comissaoValor) : null,
                    value: valor
                })
                addToCollab(app.colaborador.id, app.colaborador.nome, app.colaborador.foto)
            }

            addToService(serviceName, valor)
            addToDaily(serviceName, valor)
        }

        if (hasMatch) {
            totalSales++
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
        where.OR = [
            { colaboradorId: colaboradorId },
            { agendamento_itens: { some: { colaborador_id: colaboradorId } } }
        ]
    }

    const movements = await db.agendamento.findMany({
        where,
        include: {
            cliente: {
                select: {
                    nome: true
                }
            },
            agendamento_itens: {
                include: {
                    servicos: {
                        select: {
                            nome: true,
                            preco: true
                        }
                    },
                    colaboradores: {
                        select: {
                            id: true,
                            nome: true,
                            foto: true,
                            comissaoTipo: true,
                            comissaoValor: true
                        }
                    }
                }
            },
            colaborador: {
                select: {
                    id: true,
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

    // Flatten: 1 Appointment -> N Movements (one per item)
    return movements.flatMap(movement => {
        // If we have items (multi conduct), split them
        if (movement.agendamento_itens.length > 0) {
            return movement.agendamento_itens.map(item => {
                const colab = item.colaboradores

                // Filter logic
                if (colaboradorId && colaboradorId !== 'all' && colab?.id !== colaboradorId) {
                    return null
                }

                const itemValor = Number(item.preco)
                const comissao = colab
                    ? calculateCommission({
                        type: colab.comissaoTipo as 'PORCENTAGEM' | 'VALOR_FIXO' | null,
                        rate: colab.comissaoValor ? Number(colab.comissaoValor) : null,
                        value: itemValor
                    })
                    : 0

                return {
                    id: `${movement.id}-${item.id}`,
                    data: movement.data,
                    cliente: movement.cliente.nome,
                    servico: item.servicos.nome,
                    colaborador: {
                        name: colab?.nome || 'N/A',
                        image: colab?.foto || null
                    },
                    comissao,
                    valor: itemValor,
                    status: movement.status
                }
            }).filter(Boolean) as any[]
        }

        // Fallback for legacy data (no items)
        if (colaboradorId && colaboradorId !== 'all' && movement.colaborador?.id !== colaboradorId) {
            return []
        }

        const valor = movement.valor ? Number(movement.valor) : 0
        const comissao = movement.colaborador
            ? calculateCommission({
                type: movement.colaborador.comissaoTipo as 'PORCENTAGEM' | 'VALOR_FIXO' | null,
                rate: movement.colaborador.comissaoValor ? Number(movement.colaborador.comissaoValor) : null,
                value: valor
            })
            : 0

        return [{
            id: movement.id,
            data: movement.data,
            cliente: movement.cliente.nome,
            servico: 'Serviço (Legado)',
            colaborador: {
                name: movement.colaborador?.nome || 'N/A',
                image: movement.colaborador?.foto || null
            },
            comissao,
            valor,
            status: movement.status
        }]
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
