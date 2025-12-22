'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { servicoSchema } from '@/lib/validations/servico'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type ActionState = {
    errors?: {
        nome?: string[]
        preco?: string[]
        duracaoMin?: string[]
        _form?: string[]
    }
    message?: string
}

export async function criarServico(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Permissão negada." }
    }

    let precoRaw = formData.get('preco') as string
    if (precoRaw) {
        precoRaw = precoRaw.replace(/\./g, '').replace(',', '.')
    }

    const validatedFields = servicoSchema.safeParse({
        nome: formData.get('nome'),
        preco: precoRaw,
        duracaoMin: formData.get('duracaoMin'),
        ativo: true,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, preco, duracaoMin } = validatedFields.data

    try {
        await db.servico.create({
            data: {
                nome,
                preco: Number(preco),
                duracaoMin: Number(duracaoMin),
                ativo: true,
                empresaId: session.user.empresaId,
            },
        })
    } catch (error) {
        console.error('Erro ao criar serviço:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao cadastrar serviço.',
        }
    }

    revalidatePath('/dashboard/servicos')
    return { message: 'Serviço cadastrado com sucesso!' }
}

export async function excluirServico(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return

    try {
        // Verificação de propriedade
        const count = await db.servico.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) return

        await db.servico.delete({
            where: { id }
        })
        revalidatePath('/dashboard/servicos')
    } catch (error) {
        console.error("Failed to delete service:", error)
        throw new Error("Failed to delete service")
    }
}

export async function editarServico(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Permissão negada." }
    }

    const id = formData.get('id') as string

    let precoRaw = formData.get('preco') as string
    if (precoRaw) {
        precoRaw = precoRaw.replace(/\./g, '').replace(',', '.')
    }

    const validatedFields = servicoSchema.safeParse({
        nome: formData.get('nome'),
        preco: precoRaw,
        duracaoMin: formData.get('duracaoMin'),
        ativo: true,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, preco, duracaoMin } = validatedFields.data

    try {
        // Propriedade
        const existing = await db.servico.findFirst({
            where: { id, empresaId: session.user.empresaId }
        })
        if (!existing) return { message: "Serviço não encontrado." }

        await db.servico.update({
            where: { id },
            data: {
                nome,
                preco: Number(preco),
                duracaoMin: Number(duracaoMin),
            },
        })
    } catch (error) {
        console.error('Erro ao editar serviço:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao atualizar serviço.',
        }
    }

    revalidatePath('/dashboard/servicos')
    return { message: 'Serviço atualizado com sucesso!' }
}
