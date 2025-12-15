"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createCompanyUser(empresaId: string, formData: FormData) {
    const nome = formData.get("nome") as string
    const cnpj = formData.get("cnpj") as string
    const cargo = formData.get("cargo") as "ADMIN" | "FUNCIONARIO"
    const senha = formData.get("senha") as string

    if (!nome || !cnpj || !cargo || !senha) {
        return { error: "Todos os campos são obrigatórios." }
    }

    try {
        const hashedPassword = await hash(senha, 10)
        await db.usuario.create({
            data: {
                nome,
                cnpj: cnpj.replace(/\D/g, ""),
                cargo,
                senha: hashedPassword,
                empresaId
            }
        })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Usuário com este CNPJ já existe." }
        }
        return { error: "Erro ao criar usuário." }
    }

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { success: true }
}

export async function updateCompanyUser(userId: string, empresaId: string, formData: FormData) {
    const nome = formData.get("nome") as string
    const cargo = formData.get("cargo") as "ADMIN" | "FUNCIONARIO"
    const senha = formData.get("senha") as string | null

    if (!nome || !cargo) {
        return { error: "Nome e Cargo são obrigatórios." }
    }

    try {
        const data: any = {
            nome,
            cargo
        }
        if (senha && senha.trim() !== "") {
            data.senha = await hash(senha, 10)
        }

        await db.usuario.update({
            where: { id: userId },
            data
        })
    } catch (error) {
        return { error: "Erro ao atualizar usuário." }
    }

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { success: true }
}

export async function deleteCompanyUser(userId: string, empresaId: string) {
    try {
        await db.usuario.delete({
            where: { id: userId }
        })
    } catch (error) {
        return { error: "Erro ao excluir usuário." }
    }

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { success: true }
}
