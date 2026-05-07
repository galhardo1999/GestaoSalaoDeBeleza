"use server"

import { db } from "@/lib/db"
import { aplicarRateLimit } from "@/lib/seguranca"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const criarAgendamentoClienteSchema = z.object({
    empresaId: z.string().cuid(),
    colaboradorId: z.string().cuid(),
    servicoId: z.string().cuid(),
    data: z.coerce.date().refine((valor) => valor.getTime() > Date.now(), {
        message: "A data do agendamento deve ser no futuro",
    }),
    clienteNome: z.string().trim().min(2).max(120),
    clienteCpf: z.string().max(18).optional(),
    clienteTelefone: z.string().min(8).max(20).transform((valor) => valor.replace(/\D/g, "")),
    clienteEmail: z.string().email().max(160).optional().or(z.literal("")),
    observacoes: z.string().max(1000).optional(),
})

type CriarAgendamentoClienteInput = z.input<typeof criarAgendamentoClienteSchema>

const normalizarOpcional = (valor?: string) => {
    if (!valor) return null
    const texto = valor.trim()
    return texto.length > 0 ? texto : null
}

export async function criarAgendamentoCliente(input: CriarAgendamentoClienteInput) {
    const parsed = criarAgendamentoClienteSchema.safeParse(input)

    if (!parsed.success) {
        return { success: false, error: "Dados invalidos" }
    }

    const {
        empresaId,
        colaboradorId,
        servicoId,
        data,
        clienteNome,
        clienteCpf,
        clienteTelefone,
        clienteEmail,
        observacoes,
    } = parsed.data

    const limite = aplicarRateLimit(`agendamento_publico:${empresaId}:${clienteTelefone}`, 5, 15 * 60 * 1000)
    if (!limite.permitido) {
        return { success: false, error: "Muitas tentativas de agendamento. Tente novamente em instantes." }
    }

    try {
        const servico = await db.servico.findFirst({
            where: {
                id: servicoId,
                empresaId,
                ativo: true,
            },
            select: {
                id: true,
                preco: true,
                duracaoMin: true,
            },
        })

        if (!servico) {
            return { success: false, error: "Servico nao encontrado" }
        }

        const colaborador = await db.colaborador.findFirst({
            where: {
                id: colaboradorId,
                empresaId,
                servicos: {
                    some: { id: servicoId },
                },
            },
            select: { id: true },
        })

        if (!colaborador) {
            return { success: false, error: "Profissional nao encontrado para este servico" }
        }

        const agendamentoExistente = await db.agendamento.findFirst({
            where: {
                colaboradorId,
                data: {
                    gte: new Date(data.getTime() - servico.duracaoMin * 60 * 1000),
                    lte: new Date(data.getTime() + servico.duracaoMin * 60 * 1000),
                },
                status: {
                    in: ["AGENDADO", "PENDENTE"],
                },
            },
            select: { id: true },
        })

        if (agendamentoExistente) {
            return { success: false, error: "Horario nao disponivel. Por favor, escolha outro horario." }
        }

        const cpfNormalizado = clienteCpf ? clienteCpf.replace(/\D/g, "") : null
        const clienteExistente = await db.cliente.findFirst({
            where: {
                empresaId,
                OR: [
                    ...(cpfNormalizado ? [{ cpf: cpfNormalizado }] : []),
                    { telefone: clienteTelefone },
                ],
            },
            select: { id: true },
        })

        const cliente = clienteExistente ?? await db.cliente.create({
            data: {
                nome: clienteNome,
                telefone: clienteTelefone,
                cpf: cpfNormalizado,
                email: normalizarOpcional(clienteEmail),
                empresaId,
            },
            select: { id: true },
        })

        const agendamento = await db.agendamento.create({
            data: {
                data,
                status: "AGENDADO",
                observacoes,
                clienteId: cliente.id,
                colaboradorId,
                empresaId,
                valor: servico.preco,
                agendamento_itens: {
                    create: {
                        id: crypto.randomUUID(),
                        preco: servico.preco,
                        duracao: servico.duracaoMin,
                        servico_id: servicoId,
                        colaborador_id: colaboradorId,
                        atualizado_em: new Date(),
                    },
                },
            },
        })

        revalidatePath(`/dashboard/agendamentos`)
        revalidatePath(`/dashboard/calendario`)

        return {
            success: true,
            agendamentoId: agendamento.id,
            message: "Agendamento criado com sucesso!",
        }
    } catch (erro) {
        console.error("Erro ao criar agendamento:", erro)
        return { success: false, error: "Erro ao criar agendamento. Tente novamente." }
    }
}
