'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPlan(data: { nome: string; meses: number; valor: number; descricao?: string }) {
    try {
        await db.plano.create({
            data: {
                nome: data.nome,
                meses: data.meses,
                valor: data.valor,
                descricao: data.descricao,
            }
        })
        revalidatePath('/admin/planos')
        return { success: true }
    } catch (error) {
        console.error("Erro ao criar plano:", error)
        return { error: "Erro ao criar plano." }
    }
}

export async function togglePlanStatus(id: string, ativo: boolean) {
    try {
        await db.plano.update({
            where: { id },
            data: { ativo }
        })
        revalidatePath('/admin/planos')
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar status do plano:", error)
        return { error: "Erro ao atualizar status." }
    }
}

export async function getPlanos() {
    try {
        return await db.plano.findMany({
            orderBy: { meses: 'asc' }
        })
    } catch (error) {
        return []
    }
}

export async function getActivePlanos() {
    try {
        return await db.plano.findMany({
            where: { ativo: true },
            orderBy: { meses: 'asc' }
        })
    } catch (error) {
        return []
    }
}

export async function assignContract(data: { empresaId: string; planoId: string; inicio: Date }) {
    try {
        const plano = await db.plano.findUnique({ where: { id: data.planoId } })
        if (!plano) return { error: "Plano não encontrado." }

        // Calcular data fim
        const fim = new Date(data.inicio)
        fim.setMonth(fim.getMonth() + plano.meses)

        // Desativar contratos anteriores? 
        // Por enquanto vamos apenas criar o novo. 
        // Opcional: Atualizar contratos antigos para inativos se necessário.

        await db.contrato.create({
            data: {
                empresaId: data.empresaId,
                planoId: data.planoId,
                inicio: data.inicio,
                fim: fim,
                valorAcordado: plano.valor,
                ativo: true
            }
        })

        revalidatePath(`/admin/empresas/${data.empresaId}`)
        return { success: true }
    } catch (error) {
        console.error("Erro ao atribuir contrato:", error)
        return { error: "Erro ao atribuir contrato." }
    }
}
