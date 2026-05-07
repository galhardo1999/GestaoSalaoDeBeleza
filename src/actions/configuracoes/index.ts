"use server"

import { db } from "@/lib/db"
import { obterSessaoObrigatoria } from "@/lib/seguranca"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const configuracoesEmpresaSchema = z.object({
    nome: z.string().trim().min(2).max(120),
    telefone1: z.string().max(20).optional(),
    telefone2: z.string().max(20).optional(),
    cep: z.string().max(12).optional(),
    endereco: z.string().max(160).optional(),
    numero: z.string().max(20).optional(),
    bairro: z.string().max(80).optional(),
    cidade: z.string().max(80).optional(),
    estado: z.string().max(2).optional(),
    logo: z.string().max(300).optional(),
    banner: z.string().max(300).optional(),
    mensagemWhatsapp: z.string().max(2000).optional(),
    googleAvaliacaoUrl: z.string().max(300).optional(),
    instagramUrl: z.string().max(300).optional(),
    facebookUrl: z.string().max(300).optional(),
    formasPagamento: z.string().max(1000).optional(),
    comodidades: z.string().max(1000).optional(),
})

export type ConfiguracoesEmpresaInput = z.input<typeof configuracoesEmpresaSchema>

export async function getCompanySettings() {
    try {
        const session = await obterSessaoObrigatoria()
        if (!session) {
            return { success: false, error: "Sem permissao" }
        }

        const user = await db.usuario.findUnique({
            where: { id: session.user.id },
            include: { empresa: true },
        })

        return {
            success: true,
            data: user?.empresa,
            userEmail: user?.cnpj,
        }
    } catch {
        return { success: false, error: "Erro ao buscar configuracoes" }
    }
}

export async function updateCompanySettings(data: ConfiguracoesEmpresaInput) {
    try {
        const session = await obterSessaoObrigatoria()
        if (!session) {
            return { success: false, error: "Sem permissao" }
        }

        const parsed = configuracoesEmpresaSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: "Dados invalidos" }
        }

        await db.empresa.update({
            where: { id: session.user.empresaId },
            data: parsed.data,
        })

        revalidatePath("/dashboard/configuracoes")
        return { success: true }
    } catch {
        return { success: false, error: "Erro ao atualizar configuracoes" }
    }
}
