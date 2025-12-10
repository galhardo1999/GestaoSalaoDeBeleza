'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clienteSchema } from '@/lib/validations/cliente'

export type ActionState = {
    errors?: {
        nome?: string[]
        email?: string[]
        cpf?: string[]
        telefone?: string[]
        observacoes?: string[]
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
        cpf: formData.get('cpf'),
        telefone: formData.get('telefone'),
        observacoes: formData.get('observacoes'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, cpf, telefone, observacoes } = validatedFields.data

    try {
        await db.cliente.create({
            data: {
                nome,
                email: email || null,
                cpf: cpf || null,
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

export async function buscarDetalhesCliente(id: string) {
    try {
        const cliente = await db.cliente.findUnique({
            where: { id },
            include: {
                agendamentos: {
                    orderBy: { data: 'desc' },
                    include: {
                        servico: true,
                        usuario: {
                            select: { nome: true }
                        }
                    }
                }
            }
        })
        return cliente
    } catch (error) {
        console.error("Failed to fetch client details:", error)
        return null
    }
}

export async function editarCliente(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const id = formData.get('id') as string

    const validatedFields = clienteSchema.safeParse({
        nome: formData.get('nome'),
        email: formData.get('email'),
        cpf: formData.get('cpf'),
        telefone: formData.get('telefone'),
        observacoes: formData.get('observacoes'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, cpf, telefone, observacoes } = validatedFields.data

    try {
        await db.cliente.update({
            where: { id },
            data: {
                nome,
                email: email || null,
                cpf: cpf || null,
                telefone,
                observacoes,
            },
        })
    } catch (error) {
        console.error('Erro ao editar cliente:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao atualizar cliente.',
        }
    }

    revalidatePath('/dashboard/clientes')
    return { message: 'Cliente atualizado com sucesso!' }
}
