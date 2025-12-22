'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { agendamentoSchema } from '@/lib/validations/agendamento'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type ActionState = {
    errors?: {
        clienteId?: string[]
        servicoId?: string[]
        data?: string[]
        colaboradorId?: string[]
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

    const validatedFields = agendamentoSchema.safeParse({
        clienteId: formData.get('clienteId'),
        servicoId: formData.get('servicoId'),
        data: formData.get('data'),
        colaboradorId: formData.get('colaboradorId'),
        observacoes: formData.get('observacoes'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { clienteId, servicoId, data, colaboradorId, observacoes } = validatedFields.data

    try {
        await db.agendamento.create({
            data: {
                clienteId,
                servicoId,
                data: new Date(`${data}:00-03:00`),
                colaboradorId: colaboradorId || null,
                observacoes,
                status: 'PENDENTE' as any,
                valor: validatedFields.data.valor as any, // Cast temporário para evitar erro de tipo enquanto o Prisma gera o client atualizado
                empresaId: session.user.empresaId,
                usuarioId: session.user.id
            },
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

export async function reagendarAgendamento(
    id: string,
    novaData: Date
): Promise<{ message?: string; error?: string }> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return { error: "Sem permissão" }

    try {
        // Verificação de propriedade
        const count = await db.agendamento.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) return { error: "Agendamento não encontrado" }

        await db.agendamento.update({
            where: { id },
            data: {
                data: novaData,
                status: 'AGENDADO'
            }
        })
        revalidatePath('/dashboard/agendamentos')
        revalidatePath('/dashboard/calendario')
        revalidatePath('/dashboard')
        return { message: "Agendamento reagendado com sucesso!" }
    } catch (error) {
        console.error("Failed to reschedule:", error)
        return { error: "Erro ao reagendar. Tente novamente." }
    }
}
