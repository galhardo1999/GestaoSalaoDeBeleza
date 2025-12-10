'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clienteSchema } from '@/lib/validations/cliente'

type ActionState = {
    errors?: {
        nome?: string[]
        email?: string[]
        telefone?: string[]
        _form?: string[]
    }
    message?: string
}

export async function criarCliente(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const validatedFields = clienteSchema.safeParse({
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        observacoes: formData.get('observacoes'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, telefone, observacoes } = validatedFields.data

    try {
        await db.cliente.create({
            data: {
                nome,
                email: email || null,
                telefone,
                observacoes,
            },
        })
    } catch (error) {
        console.error('Erro ao criar cliente:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao cadastrar cliente.',
        }
    }

    revalidatePath('/dashboard/clientes')
    return { message: 'Cliente cadastrado com sucesso!' }
    // Not redirecting here to allow adding multiple
}

export async function excluirCliente(id: string) {
    try {
        await db.cliente.delete({
            where: { id }
        })
        revalidatePath('/dashboard/clientes')
    } catch (error) {
        console.error("Failed to delete client:", error)
        throw new Error("Failed to delete client")
    }
}
