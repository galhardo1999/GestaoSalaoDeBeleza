'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { colaboradorSchema, colaboradorEdicaoSchema } from '@/lib/validations/colaborador'
import { hash } from 'bcryptjs'

type ActionState = {
    errors?: {
        nome?: string[]
        email?: string[]
        senha?: string[]
        _form?: string[]
    }
    message?: string
}

export async function criarColaborador(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const validatedFields = colaboradorSchema.safeParse({
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, senha } = validatedFields.data

    try {
        const existingUser = await db.colaborador.findUnique({
            where: { email }
        })

        if (existingUser) {
            return {
                errors: {
                    email: ['Este email já está em uso.'],
                },
            }
        }

        const hashedPassword = await hash(senha, 10)

        await db.colaborador.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
            },
        })
    } catch (error) {
        console.error('Erro ao criar colaborador:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao cadastrar colaborador.',
        }
    }

    revalidatePath('/dashboard/colaboradores')
    return { message: 'Colaborador cadastrado com sucesso!' }
}

export async function excluirColaborador(id: string) {
    try {
        await db.colaborador.delete({
            where: { id }
        })
        revalidatePath('/dashboard/colaboradores')
    } catch (error) {
        console.error("Failed to delete colaborador:", error)
        throw new Error("Failed to delete colaborador")
    }
}

export async function editarColaborador(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const id = formData.get('id') as string

    // Explicitly handle empty password by removing it if it's empty string
    const rawData = {
        id,
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha') || undefined,
    }

    // @ts-ignore - Validating with optional password
    const validatedFields = colaboradorEdicaoSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, senha } = validatedFields.data

    try {
        const dataToUpdate: any = { nome, email }

        if (senha) {
            dataToUpdate.senha = await hash(senha, 10)
        }

        await db.colaborador.update({
            where: { id },
            data: dataToUpdate,
        })
    } catch (error) {
        console.error('Erro ao editar colaborador:', error)
        return {
            message: 'Erro no Banco de Dados: Falha ao atualizar colaborador.',
        }
    }

    revalidatePath('/dashboard/colaboradores')
    return { message: 'Colaborador atualizado com sucesso!' }
}
