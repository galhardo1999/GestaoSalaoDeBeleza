"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function checkSuperAdmin() {
    const session = await getServerSession(authOptions)
    // @ts-ignore
    if (!session || session.user?.cargo !== "SUPER_ADMIN") {
        throw new Error("Acesso não autorizado.")
    }
}

export async function createEmpresa(formData: FormData) {
    try {
        await checkSuperAdmin()
    } catch (e) {
        return { error: "Sem permissão." }
    }

    const nomeEmpresa = formData.get("nomeEmpresa") as string
    const cnpjEmpresa = formData.get("cnpjEmpresa") as string
    const telefone1 = formData.get("telefone1") as string
    const telefone2 = formData.get("telefone2") as string

    // Campos de endereço
    const cep = formData.get("cep") as string
    const endereco = formData.get("endereco") as string
    const numero = formData.get("numero") as string
    const bairro = formData.get("bairro") as string
    const cidade = formData.get("cidade") as string
    const estado = formData.get("estado") as string

    if (!nomeEmpresa || !cnpjEmpresa) {
        return { error: "Todos os campos são obrigatórios." }
    }

    try {
        await db.empresa.create({
            data: {
                nome: nomeEmpresa,
                cnpj: cnpjEmpresa.replace(/\D/g, ""), // Armazenar apenas números
                telefone1: telefone1.replace(/\D/g, ""),
                telefone2: telefone2.replace(/\D/g, ""),
                cep,
                endereco,
                numero,
                bairro,
                cidade,
                estado
            }
        })
    } catch (error: any) {
        console.error("Error creating empresa:", error)
        if (error.code === 'P2002') {
            return { error: "Empresa com este CNPJ já existe." }
        }
        return { error: "Erro ao criar empresa. Tente novamente." }
    }

    revalidatePath("/admin/empresas")
    redirect("/admin/empresas")
}

export async function deleteEmpresa(id: string) {
    try {
        await checkSuperAdmin()
        await db.empresa.delete({
            where: { id }
        })
        revalidatePath("/admin/empresas")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete company:", error)
        return { error: "Erro ao excluir empresa." }
    }
}

export async function updateEmpresa(formData: FormData) {
    try {
        await checkSuperAdmin()
    } catch (e) {
        return { error: "Sem permissão." }
    }

    const id = formData.get("id") as string
    const nome = formData.get("nome") as string
    const cnpj = formData.get("cnpj") as string

    if (!id || !nome || !cnpj) return { error: "Campos obrigatórios faltando." }

    try {
        await db.empresa.update({
            where: { id },
            data: {
                nome,
                cnpj: cnpj.replace(/\D/g, ""),
            }
        })
        revalidatePath("/admin/empresas")
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update company:", error)
        if (error.code === 'P2002') return { error: "CNPJ já cadastrado." }
        return { error: "Erro ao atualizar empresa." }
    }
}

export async function consultarCNPJ(cnpj: string) {
    try {
        await checkSuperAdmin()

        const cleanCNPJ = cnpj.replace(/\D/g, "")
        if (cleanCNPJ.length !== 14) {
            return { error: "CNPJ inválido." }
        }

        const response = await fetch(`https://open.cnpja.com/office/${cleanCNPJ}`)

        if (!response.ok) {
            if (response.status === 404) return { error: "CNPJ não encontrado." }
            if (response.status === 429) return { error: "Muitas requisições. Tente novamente em instantes." }
            return { error: "Erro ao consultar CNPJ." }
        }

        const data = await response.json()
        return { data }

    } catch (error) {
        console.error("CNPJ lookup error:", error)
        return { error: "Erro ao consultar serviço de CNPJ." }
    }
}

