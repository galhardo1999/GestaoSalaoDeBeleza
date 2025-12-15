'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clienteSchema } from '@/lib/validations/cliente'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Usuário não autenticado ou sem empresa." }
    }

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
                empresaId: session.user.empresaId
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return { error: "Sem permissão." }

    try {
        const agendamentosCount = await db.agendamento.count({
            where: { clienteId: id, empresaId: session.user.empresaId }
        })

        if (agendamentosCount > 0) {
            return { error: "Não é possível fazer a exclusão do cliente, pois tem lançamentos nele." }
        }

        // Verify ownership
        const cliente = await db.cliente.findFirst({
            where: { id, empresaId: session.user.empresaId }
        })

        if (!cliente) return { error: "Cliente não encontrado ou acesso negado." }

        await db.cliente.delete({
            where: { id }
        })
        revalidatePath('/dashboard/clientes')
        return { message: "Cliente excluído com sucesso." }
    } catch (error) {
        console.error("Failed to delete client:", error)
        return { error: "Erro ao excluir cliente." }
    }
}

export async function buscarDetalhesCliente(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return null

    try {
        const cliente = await db.cliente.findFirst({
            where: { id, empresaId: session.user.empresaId },
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Sem permissão." }
    }

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
        // Check ownership before update
        const existing = await db.cliente.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (!existing) return { message: "Cliente não encontrado." }

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
