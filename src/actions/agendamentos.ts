'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { agendamentoSchema } from '@/lib/validations/agendamento'

type ActionState = {
    errors?: {
        clienteId?: string[]
        servicoId?: string[]
        data?: string[]
        colaboradorId?: string[]
        _form?: string[]
    }
    message?: string
}

export async function criarAgendamento(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
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
            },
        })
    } catch (error) {
        console.error('Erro de Banco de Dados:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao criar agendamento.',
        }
    }

    revalidatePath('/dashboard/agendamentos')
    revalidatePath('/dashboard')
    redirect('/dashboard/agendamentos')
}

export async function cancelarAgendamento(id: string) {
    try {
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
    try {
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

export async function reagendarAgendamento(
    id: string,
    novaData: Date
): Promise<{ message?: string; error?: string }> {
    try {
        await db.agendamento.update({
            where: { id },
            data: {
                data: novaData,
                status: 'AGENDADO' // Reset status just in case (e.g. from Cancelled to Scheduled if allowed, otherwise assumes Scheduled)
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
