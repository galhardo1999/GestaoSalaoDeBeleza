'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { colaboradorSchema, colaboradorEdicaoSchema } from '@/lib/validations/colaborador'
import { hash } from 'bcryptjs'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Permissão negada." }
    }

    const servicosRaw = formData.getAll('servicos') as string[]

    const validatedFields = colaboradorSchema.safeParse({
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        foto: formData.get('foto'),
        servicos: servicosRaw,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, senha, foto, servicos } = validatedFields.data

    try {
        const existingUser = await db.colaborador.findFirst({
            where: { email } // Email deve ser único globalmente ou por empresa? Schema diz único globalmente por simplicidade geralmente, mas aqui email tem restrição @unique.
        })

        if (existingUser) {
            return {
                errors: {
                    email: ['Este email já está em uso.'],
                },
            }
        }

        const hashedPassword = await hash(senha, 10)

        // Verificar propriedade dos serviços
        if (servicos && servicos.length > 0) {
            const count = await db.servico.count({
                where: {
                    id: { in: servicos },
                    empresaId: session.user.empresaId
                }
            })
            if (count !== servicos.length) {
                return { message: "Serviço inválido ou de outra empresa." }
            }
        }

        await db.colaborador.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
                foto: foto || null,
                empresaId: session.user.empresaId,
                servicos: servicos && servicos.length > 0 ? {
                    connect: servicos.map(id => ({ id }))
                } : undefined
            } as any,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) return

    try {
        // Verificação de propriedade
        const count = await db.colaborador.count({
            where: { id, empresaId: session.user.empresaId }
        })
        if (count === 0) return

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        return { message: "Erro: Permissão negada" }
    }

    const id = formData.get('id') as string

    const servicosRaw = formData.getAll('servicos') as string[]

    // Tratar explicitamente senha vazia removendo-a se for string vazia
    const rawData = {
        id,
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha') || undefined,
        foto: formData.get('foto'),
        servicos: servicosRaw
    }

    // @ts-ignore - Validando com senha opcional
    const validatedFields = colaboradorEdicaoSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, senha, foto, servicos } = validatedFields.data

    try {
        // Propriedade
        const existing = await db.colaborador.findFirst({
            where: { id, empresaId: session.user.empresaId }
        })
        if (!existing) return { message: "Colaborador não encontrado." }

        const dataToUpdate: any = {
            nome,
            email,
            foto,
            servicos: {
                set: servicos ? servicos.map(id => ({ id })) : []
            }
        }

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
            message: `Erro: ${(error as Error).message}`,
        }
    }

    revalidatePath('/dashboard/colaboradores')
    return { message: 'Colaborador atualizado com sucesso!' }
}
