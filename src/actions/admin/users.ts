"use server"

import { db } from "@/lib/db"
import { exigirSuperAdmin } from "@/lib/seguranca"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const usuarioEmpresaSchema = z.object({
    nome: z.string().trim().min(2).max(120),
    cnpj: z.string().transform((valor) => valor.replace(/\D/g, "")).refine(
        (valor) => valor.length === 11 || valor.length === 14,
        "Documento invalido",
    ),
    cargo: z.enum(["ADMIN", "FUNCIONARIO"]),
    senha: z.string().min(8).max(128),
})

const editarUsuarioEmpresaSchema = usuarioEmpresaSchema
    .omit({ cnpj: true, senha: true })
    .extend({
        senha: z.string().max(128).optional(),
    })

const idsSchema = z.object({
    empresaId: z.string().cuid(),
    userId: z.string().cuid().optional(),
})

type ResultadoAcao =
    | { success: true; error?: never }
    | { success: false; error: string }

const validarEmpresa = async (empresaId: string) => {
    const empresa = await db.empresa.findUnique({
        where: { id: empresaId },
        select: { id: true },
    })

    return Boolean(empresa)
}

const validarUsuarioDaEmpresa = async (userId: string, empresaId: string) => {
    const usuario = await db.usuario.findFirst({
        where: { id: userId, empresaId },
        select: { id: true },
    })

    return Boolean(usuario)
}

export async function createCompanyUser(empresaId: string, formData: FormData): Promise<ResultadoAcao> {
    try {
        await exigirSuperAdmin()

        const ids = idsSchema.safeParse({ empresaId })
        if (!ids.success || !(await validarEmpresa(empresaId))) {
            return { success: false, error: "Empresa invalida." }
        }

        const parsed = usuarioEmpresaSchema.safeParse({
            nome: formData.get("nome"),
            cnpj: formData.get("cnpj"),
            cargo: formData.get("cargo"),
            senha: formData.get("senha"),
        })

        if (!parsed.success) {
            return { success: false, error: "Dados invalidos." }
        }

        const senhaCriptografada = await hash(parsed.data.senha, 12)
        await db.usuario.create({
            data: {
                nome: parsed.data.nome,
                cnpj: parsed.data.cnpj,
                cargo: parsed.data.cargo,
                senha: senhaCriptografada,
                empresaId,
            },
        })
    } catch (erro) {
        if (typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2002") {
            return { success: false, error: "Usuario com este documento ja existe." }
        }
        return { success: false, error: "Erro ao criar usuario." }
    }

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { success: true }
}

export async function updateCompanyUser(
    userId: string,
    empresaId: string,
    formData: FormData,
): Promise<ResultadoAcao> {
    try {
        await exigirSuperAdmin()

        const ids = idsSchema.safeParse({ userId, empresaId })
        if (!ids.success || !(await validarUsuarioDaEmpresa(userId, empresaId))) {
            return { success: false, error: "Usuario nao encontrado ou acesso negado." }
        }

        const parsed = editarUsuarioEmpresaSchema.safeParse({
            nome: formData.get("nome"),
            cargo: formData.get("cargo"),
            senha: formData.get("senha") || undefined,
        })

        if (!parsed.success) {
            return { success: false, error: "Dados invalidos." }
        }

        const data = parsed.data.senha && parsed.data.senha.trim() !== ""
            ? {
                nome: parsed.data.nome,
                cargo: parsed.data.cargo,
                senha: await hash(parsed.data.senha, 12),
            }
            : {
                nome: parsed.data.nome,
                cargo: parsed.data.cargo,
            }

        await db.usuario.update({
            where: { id: userId },
            data,
        })
    } catch {
        return { success: false, error: "Erro ao atualizar usuario." }
    }

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { success: true }
}

export async function deleteCompanyUser(userId: string, empresaId: string): Promise<ResultadoAcao> {
    try {
        await exigirSuperAdmin()

        const ids = idsSchema.safeParse({ userId, empresaId })
        if (!ids.success || !(await validarUsuarioDaEmpresa(userId, empresaId))) {
            return { success: false, error: "Usuario nao encontrado ou acesso negado." }
        }

        await db.usuario.delete({
            where: { id: userId },
        })
    } catch {
        return { success: false, error: "Erro ao excluir usuario." }
    }

    revalidatePath(`/admin/empresas/${empresaId}`)
    return { success: true }
}
