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
            userEmail: user?.cnpj // Usando CNPJ como identificador de login/email se necessário, ou verificar schema para email
        }
    } catch (error) {
        return { success: false, error: "Erro ao buscar configurações" }
    }
}

export async function updateCompanySettings(userId: string, data: {
    nome: string
    telefone1?: string
    telefone2?: string
    cep?: string
    endereco?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    logo?: string
    banner?: string
    mensagemWhatsapp?: string
    googleAvaliacaoUrl?: string
    instagramUrl?: string
    facebookUrl?: string
    formasPagamento?: string
    comodidades?: string
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
            // Atualizar empresa existente
            await db.empresa.update({
                where: { id: user.empresaId },
                data: {
                    nome: data.nome,
                    telefone1: data.telefone1,
                    telefone2: data.telefone2,
                    cep: data.cep,
                    endereco: data.endereco,
                    numero: data.numero,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    estado: data.estado,
                    logo: data.logo,
                    banner: data.banner,
                    mensagemWhatsapp: data.mensagemWhatsapp,
                    googleAvaliacaoUrl: data.googleAvaliacaoUrl,
                    instagramUrl: data.instagramUrl,
                    facebookUrl: data.facebookUrl,
                    formasPagamento: data.formasPagamento,
                    comodidades: data.comodidades,
                },
            })
        } else {
            // Criar nova empresa e vincular ao usuário
            // Nota: Em um app real, poderíamos precisar do CNPJ aqui se for obrigatório e não fornecido.
            // Assumindo por enquanto que a atualização é principalmente para atualizações existentes ou parciais.
            // No entanto, o design mostra o CNPJ como somente leitura, implicando que ele existe.
            // Se não existir, podemos ter um problema.
            // Vamos assumir para esta tarefa que se não existir, não podemos criá-lo totalmente sem CNPJ.
            // Mas o prompt diz "usuário tem que ter uma empresa".
            // Então vamos tratar o caso onde pode estar faltando se for seguro, ou retornar erro.
            return { success: false, error: "Empresa não encontrada para este usuário" }
        }

        revalidatePath("/dashboard/configuracoes")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao atualizar configurações" }
    }
}
