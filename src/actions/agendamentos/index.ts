'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { agendamentoSchema, agendamentoMultiServicoSchema } from '@/lib/validations/agendamento'
import { z } from 'zod'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type ActionState = {
    errors?: {
        clienteId?: string[]
        servicoId?: string[]
        data?: string[]
        colaboradorId?: string[]
        servicos?: string[]
        _form?: string[]
    }
    message?: string
    success?: boolean
}

export async function criarAgendamento(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Usuário sem empresa definida." }
    }

    // Parse services JSON from form
    const servicosRaw = formData.get('servicos')
    let servicos: { servicoId: string; colaboradorId?: string; valor?: string }[] = []

    try {
        servicos = JSON.parse(servicosRaw as string || '[]')
    } catch {
        return { errors: { servicos: ['Formato de serviços inválido'] } }
    }

    const validatedFields = agendamentoMultiServicoSchema.safeParse({
        clienteId: formData.get('clienteId'),
        data: formData.get('data'),
        servicos,
        observacoes: formData.get('observacoes'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors as ActionState['errors'],
        }
    }

    const { clienteId, data, observacoes } = validatedFields.data
    const validatedServicos = validatedFields.data.servicos

    // Calculate total value
    const totalValor = validatedServicos.reduce((acc, s) => {
        const valorStr = typeof s.valor === 'string' ? s.valor : String(s.valor || '0')
        return acc + (parseFloat(valorStr) || 0)
    }, 0)

    try {
        // Get service details for duration
        const servicoIds = validatedServicos.map(s => s.servicoId)
        const servicosDb = await db.servico.findMany({
            where: { id: { in: servicoIds } },
            select: { id: true, duracaoMin: true, preco: true }
        })
        const servicoMap = new Map(servicosDb.map(s => [s.id, s]))

        // Create single agendamento with items in transaction
        await db.$transaction(async (tx) => {
            // Create the main appointment
            const agendamento = await tx.agendamento.create({
                data: {
                    clienteId,
                    data: new Date(`${data}:00-03:00`),
                    observacoes,
                    status: 'PENDENTE',
                    valor: totalValor,
                    empresaId: session.user.empresaId!,
                    usuarioId: session.user.id,
                    // Use first colaborador as main if any
                    colaboradorId: validatedServicos[0]?.colaboradorId || null,
                },
            })

            // Create agendamento_itens for each service
            for (const servico of validatedServicos) {
                const servicoInfo = servicoMap.get(servico.servicoId)
                const valorStr = typeof servico.valor === 'string' ? servico.valor : String(servico.valor || '0')
                await tx.agendamento_itens.create({
                    data: {
                        id: crypto.randomUUID(),
                        agendamento_id: agendamento.id,
                        servico_id: servico.servicoId,
                        colaborador_id: servico.colaboradorId || validatedServicos[0]?.colaboradorId || '',
                        preco: parseFloat(valorStr) || Number(servicoInfo?.preco || 0),
                        duracao: servicoInfo?.duracaoMin || 30,
                        atualizado_em: new Date(),
                    }
                })
            }
        })
    } catch (error) {
        console.error('Erro de Banco de Dados:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao criar agendamento.',
        }
    }

    revalidatePath('/dashboard/agendamentos')
    revalidatePath('/dashboard/calendario')
    revalidatePath('/dashboard')
    return { message: 'Agendamento criado com sucesso!', success: true }
}

export async function cancelarAgendamento(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return

    try {
        // Verificação de propriedade
        const count = await db.agendamento.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) throw new Error("Acesso negado")

        await db.agendamento.update({
            where: { id },
            data: { status: 'CANCELADO' }
        })
        revalidatePath('/dashboard/agendamentos')
        revalidatePath('/dashboard')
    } catch (error) {
        console.error("Failed to cancel appointment:", error)
        throw new Error("Failed to cancel appointment")
    }
}

export async function confirmarAgendamento(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return

    try {
        // Verificação de propriedade
        const count = await db.agendamento.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) throw new Error("Acesso negado")

        await db.agendamento.update({
            where: { id },
            data: { status: 'AGENDADO' }
        })
        revalidatePath('/dashboard/agendamentos')
        revalidatePath('/dashboard')
    } catch (error) {
        console.error("Failed to confirm appointment:", error)
        throw new Error("Failed to confirm appointment")
    }
}

export async function concluirAgendamento(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return

    try {
        // Verificação de propriedade
        const count = await db.agendamento.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) throw new Error("Acesso negado")

        await db.agendamento.update({
            where: { id },
            data: { status: 'CONCLUIDO' }
        })
        revalidatePath('/dashboard/agendamentos')
        revalidatePath('/dashboard')
    } catch (error) {
        console.error("Failed to conclude appointment:", error)
        throw new Error("Failed to conclude appointment")
    }
}



export async function editarAgendamento(
    id: string,
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Usuário sem empresa definida." }
    }

    const servicosJson = formData.get('servicos') as string
    let servicosData: any[] = []
    try {
        servicosData = JSON.parse(servicosJson || '[]')
    } catch (e) {
        return { message: "Erro: Dados dos serviços inválidos." }
    }

    const validatedFields = agendamentoMultiServicoSchema.safeParse({
        clienteId: formData.get('clienteId'),
        data: formData.get('data'),
        observacoes: formData.get('observacoes'),
        servicos: servicosData
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { clienteId, data, observacoes, servicos } = validatedFields.data

    try {
        const count = await db.agendamento.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) return { message: "Erro: Agendamento não encontrado ou sem permissão." }

        // Calculate total
        const totalValor = servicos.reduce((acc, item) => {
            return acc + (item.valor || 0)
        }, 0)

        // Get services info for duration
        const servicosIds = servicos.map(s => s.servicoId)
        const servicosDb = await db.servico.findMany({
            where: { id: { in: servicosIds } }
        })
        const servicoMap = new Map(servicosDb.map(s => [s.id, s]))

        await db.$transaction(async (tx) => {
            // Update main record
            await tx.agendamento.update({
                where: { id },
                data: {
                    clienteId,
                    data: new Date(`${data}:00-03:00`),
                    observacoes,
                    valor: String(totalValor),
                    status: 'AGENDADO',
                    colaboradorId: servicos[0]?.colaboradorId || null
                }
            })

            // Replace items
            await tx.agendamento_itens.deleteMany({
                where: { agendamento_id: id }
            })

            for (const item of servicos) {
                const servicoInfo = servicoMap.get(item.servicoId)
                await tx.agendamento_itens.create({
                    data: {
                        id: crypto.randomUUID(),
                        agendamento_id: id,
                        servico_id: item.servicoId,
                        colaborador_id: item.colaboradorId || '',
                        preco: Number(item.valor || 0),
                        duracao: servicoInfo?.duracaoMin || 30,
                        atualizado_em: new Date()
                    }
                })
            }
        })

        revalidatePath('/dashboard/agendamentos')
        revalidatePath('/dashboard/calendario')
        revalidatePath('/dashboard')
        return { message: 'Agendamento atualizado com sucesso!', success: true }

    } catch (error) {
        console.error('Erro de Banco de Dados:', error)
        return {
            message: 'Erro ao atualizar agendamento.',
        }
    }
}
