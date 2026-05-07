'use server'

import { db } from "@/lib/db"
import { exigirSuperAdmin } from "@/lib/seguranca"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const planoSchema = z.object({
    nome: z.string().trim().min(2).max(80),
    meses: z.number().int().min(1).max(120),
    valor: z.number().min(0).max(999999),
    descricao: z.string().trim().max(500).optional(),
})

const statusPlanoSchema = z.object({
    id: z.string().cuid(),
    ativo: z.boolean(),
})

const contratoSchema = z.object({
    empresaId: z.string().cuid(),
    planoId: z.string().cuid(),
    inicio: z.coerce.date(),
})

type ResultadoAcao =
    | { success: true }
    | { success: false; error: string }

export async function createPlan(data: z.input<typeof planoSchema>): Promise<ResultadoAcao> {
    try {
        await exigirSuperAdmin()

        const parsed = planoSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: "Dados invalidos." }
        }

        await db.plano.create({
            data: parsed.data,
        })
        revalidatePath('/admin/planos')
        return { success: true }
    } catch (erro) {
        console.error("Erro ao criar plano:", erro)
        return { success: false, error: "Erro ao criar plano." }
    }
}

export async function togglePlanStatus(id: string, ativo: boolean): Promise<ResultadoAcao> {
    try {
        await exigirSuperAdmin()

        const parsed = statusPlanoSchema.safeParse({ id, ativo })
        if (!parsed.success) {
            return { success: false, error: "Dados invalidos." }
        }

        await db.plano.update({
            where: { id: parsed.data.id },
            data: { ativo: parsed.data.ativo }
        })
        revalidatePath('/admin/planos')
        return { success: true }
    } catch (erro) {
        console.error("Erro ao atualizar status do plano:", erro)
        return { success: false, error: "Erro ao atualizar status." }
    }
}

export async function getPlanos() {
    try {
        await exigirSuperAdmin()

        return await db.plano.findMany({
            orderBy: { meses: 'asc' }
        })
    } catch {
        return []
    }
}

export async function getActivePlanos() {
    try {
        await exigirSuperAdmin()

        return await db.plano.findMany({
            where: { ativo: true },
            orderBy: { meses: 'asc' }
        })
    } catch {
        return []
    }
}

export async function assignContract(data: z.input<typeof contratoSchema>): Promise<ResultadoAcao> {
    try {
        await exigirSuperAdmin()

        const parsed = contratoSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: "Dados invalidos." }
        }

        const plano = await db.plano.findUnique({ where: { id: parsed.data.planoId } })
        if (!plano) return { success: false, error: "Plano nao encontrado." }

        const empresa = await db.empresa.findUnique({
            where: { id: parsed.data.empresaId },
            select: { id: true },
        })
        if (!empresa) return { success: false, error: "Empresa nao encontrada." }

        const fim = new Date(parsed.data.inicio)
        fim.setMonth(fim.getMonth() + plano.meses)

        await db.$transaction([
            db.contrato.updateMany({
                where: {
                    empresaId: parsed.data.empresaId,
                    ativo: true,
                },
                data: {
                    ativo: false,
                },
            }),
            db.contrato.create({
                data: {
                    empresaId: parsed.data.empresaId,
                    planoId: parsed.data.planoId,
                    inicio: parsed.data.inicio,
                    fim,
                    valorAcordado: plano.valor,
                    ativo: true,
                },
            }),
        ])

        revalidatePath(`/admin/empresas/${parsed.data.empresaId}`)
        return { success: true }
    } catch (erro) {
        console.error("Erro ao atribuir contrato:", erro)
        return { success: false, error: "Erro ao atribuir contrato." }
    }
}
