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
        cpf: formData.get('cpf'),
        senha: formData.get('senha'),
        foto: formData.get('foto'),
        servicos: servicosRaw,
        comissaoTipo: formData.get('comissaoTipo') || 'PORCENTAGEM',
        comissaoValor: formData.get('comissaoValor') || undefined,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, cpf: cpfRaw, senha, foto, servicos, comissaoTipo, comissaoValor } = validatedFields.data

    // Remove formatação do CPF
    const cpf = cpfRaw ? cpfRaw.replace(/\D/g, '') : null;

    try {
        const existingUser = await db.colaborador.findFirst({
            where: { email }
        })

        if (existingUser) {
            return {
                errors: {
                    email: ['Este email já está em uso.'],
                },
            }
        }

        if (cpf) {
            const existingCpf = await db.colaborador.findFirst({
                where: { cpf }
            })

            if (existingCpf) {
                return {
                    message: 'Erro: Este CPF já está cadastrado para outro colaborador.'
                }
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

        // Verificar se já existe um usuário com este CPF (usado como login)
        if (cpf && senha) {
            const existingUsuario = await db.usuario.findUnique({
                where: { cnpj: cpf }
            })
            if (existingUsuario) {
                return { message: "Erro: Já existe um usuário de sistema com este CPF." }
            }
        }

        await db.$transaction(async (tx) => {
            await tx.colaborador.create({
                data: {
                    nome,
                    email,
                    cpf: cpf || null,
                    senha: hashedPassword,
                    foto: foto || null,
                    comissaoTipo: comissaoTipo as any,
                    comissaoValor: comissaoValor ?? null,
                    empresaId: session.user.empresaId,
                    servicos: servicos && servicos.length > 0 ? {
                        connect: servicos.map(id => ({ id }))
                    } : undefined
                } as any,
            })

            // Criar usuário de sistema se tiver CPF (login) e senha
            if (cpf && senha) {
                await tx.usuario.create({
                    data: {
                        nome,
                        cnpj: cpf, // Usa CPF como login
                        senha: hashedPassword,
                        cargo: 'FUNCIONARIO',
                        empresaId: session.user.empresaId
                    }
                })
            }
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
        cpf: formData.get('cpf'),
        senha: formData.get('senha') || undefined,
        foto: formData.get('foto'),
        servicos: servicosRaw,
        comissaoTipo: formData.get('comissaoTipo') || undefined,
        comissaoValor: formData.get('comissaoValor') || undefined,
    }

    // @ts-ignore - Validando com senha opcional
    const validatedFields = colaboradorEdicaoSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { nome, email, cpf, senha, foto, servicos, comissaoTipo, comissaoValor } = validatedFields.data

    try {
        // Propriedade
        const existing = await db.colaborador.findFirst({
            where: { id, empresaId: session.user.empresaId }
        })
        if (!existing) return { message: "Colaborador não encontrado." }

        // Verificar uniqueness do CPF se foi fornecido e mudou
        if (cpf && cpf !== existing.cpf) {
            const existingCpf = await db.colaborador.findFirst({
                where: { cpf }
            })
            if (existingCpf && existingCpf.id !== id) {
                return { message: "Erro: Este CPF já está em uso por outro colaborador." }
            }
        }

        const dataToUpdate: any = {
            nome,
            email,
            cpf: cpf || null,
            foto,
            comissaoTipo: comissaoTipo as any,
            comissaoValor: comissaoValor ?? null,
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
