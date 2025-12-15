"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createEmpresa(formData: FormData) {
    const nomeEmpresa = formData.get("nomeEmpresa") as string
    const cnpjEmpresa = formData.get("cnpjEmpresa") as string

    const nomeUsuario = formData.get("nomeUsuario") as string
    const cnpjUsuario = formData.get("cnpjUsuario") as string
    const senhaUsuario = formData.get("senhaUsuario") as string

    if (!nomeEmpresa || !cnpjEmpresa || !nomeUsuario || !cnpjUsuario || !senhaUsuario) {
        return { error: "Todos os campos são obrigatórios." }
    }

    try {
        await db.$transaction(async (tx) => {
            // 1. Create Empresa
            const empresa = await tx.empresa.create({
                data: {
                    nome: nomeEmpresa,
                    cnpj: cnpjEmpresa.replace(/\D/g, ""), // Store only numbers
                }
            })

            // 2. Create Admin User
            const hashedPassword = await hash(senhaUsuario, 10)
            await tx.usuario.create({
                data: {
                    nome: nomeUsuario,
                    cnpj: cnpjUsuario.replace(/\D/g, ""),
                    senha: hashedPassword,
                    cargo: "ADMIN",
                    empresaId: empresa.id
                }
            })
        })
    } catch (error: any) {
        console.error("Error creating empresa:", error)
        if (error.code === 'P2002') {
            return { error: "Empresa ou Usuário com este CNPJ já existe." }
        }
        return { error: "Erro ao criar empresa. Tente novamente." }
    }

    revalidatePath("/admin/empresas")
    redirect("/admin/empresas")
}
