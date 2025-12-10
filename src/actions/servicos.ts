'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { servicoSchema } from '@/lib/validations/servico'

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
    const validatedFields = servicoSchema.safeParse({
        nome: formData.get('nome'),
        preco: formData.get('preco'),
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
    try {
        await db.servico.delete({
            where: { id }
        })
        revalidatePath('/dashboard/servicos')
    } catch (error) {
        console.error("Failed to delete service:", error)
        throw new Error("Failed to delete service")
    }
}
