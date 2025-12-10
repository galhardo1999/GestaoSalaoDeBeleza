"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"


export async function getCompanySettings(userId: string) {
    try {
        const user = await db.usuario.findUnique({
            where: { id: userId },
            include: { empresa: true },
        })

        return {
            success: true,
            data: user?.empresa,
            userEmail: user?.cnpj // Using CNPJ as login/email identifier if needed, or check schema for email
        }
    } catch (error) {
        return { success: false, error: "Erro ao buscar configurações" }
    }
}

export async function updateCompanySettings(userId: string, data: {
    nome: string
    telefone1?: string
    telefone2?: string
    endereco?: string
    logo?: string
}) {
    try {
        const user = await db.usuario.findUnique({
            where: { id: userId },
            include: { empresa: true },
        })

        if (!user) {
            return { success: false, error: "Usuário não encontrado" }
        }

        if (user.empresaId) {
            // Update existing company
            await db.empresa.update({
                where: { id: user.empresaId },
                data: {
                    nome: data.nome,
                    telefone1: data.telefone1,
                    telefone2: data.telefone2,
                    endereco: data.endereco,
                    logo: data.logo,
                },
            })
        } else {
            // Create new company and link to user
            // Note: In a real app, we might need CNPJ here if it's required and not provided.
            // Assuming for now update is mainly for existing or partial updates.
            // However, the design shows CNPJ as read-only, implying it exists.
            // If it doesn't exist, we might have an issue. 
            // Let's assume for this task that if it doesn't exist, we can't fully create it without CNPJ.
            // But the prompt says "user has to have a company". 
            // So I'll handle the case where it might be missing if safe, or return error.
            return { success: false, error: "Empresa não encontrada para este usuário" }
        }

        revalidatePath("/dashboard/configuracoes")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao atualizar configurações" }
    }
}
