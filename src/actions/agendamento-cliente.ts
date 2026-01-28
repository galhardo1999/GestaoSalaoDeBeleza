"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

interface CriarAgendamentoInput {
    empresaId: string
    colaboradorId: string
    servicoId: string
    data: Date
    preco: number
    duracao: number
    clienteId?: string
    clienteNome?: string
    clienteCpf?: string
    clienteTelefone?: string
    clienteEmail?: string
    observacoes?: string
}

export async function criarAgendamentoCliente(input: CriarAgendamentoInput) {
    try {
        const {
            empresaId,
            colaboradorId,
            servicoId,
            data,
            preco,
            duracao,
            clienteId,
            clienteNome,
            clienteCpf,
            clienteTelefone,
            clienteEmail,
            observacoes
        } = input

        // Validate the service exists and belongs to the company
        const servico = await db.servico.findFirst({
            where: {
                id: servicoId,
                empresaId,
                ativo: true,
            },
        })

        if (!servico) {
            return { success: false, error: "Serviço não encontrado" }
        }

        // Validate the collaborator exists and belongs to the company
        const colaborador = await db.colaborador.findFirst({
            where: {
                id: colaboradorId,
                empresaId,
            },
            include: {
                servicos: {
                    where: { id: servicoId },
                },
            },
        })

        if (!colaborador) {
            return { success: false, error: "Profissional não encontrado" }
        }

        if (colaborador.servicos.length === 0) {
            return { success: false, error: "Este profissional não realiza o serviço selecionado" }
        }

        // Check for time conflicts
        const agendamentoExistente = await db.agendamento.findFirst({
            where: {
                colaboradorId,
                data: {
                    gte: new Date(data.getTime() - duracao * 60 * 1000),
                    lte: new Date(data.getTime() + duracao * 60 * 1000),
                },
                status: {
                    in: ["AGENDADO", "PENDENTE"],
                },
            },
        })

        if (agendamentoExistente) {
            return { success: false, error: "Horário não disponível. Por favor, escolha outro horário." }
        }

        // Determine or create the client
        let finalClienteId = clienteId

        if (!finalClienteId && clienteNome && clienteTelefone) {
            // Check if client already exists by phone or CPF
            let existingCliente = null

            if (clienteCpf) {
                const cpfNormalizado = clienteCpf.replace(/\D/g, '')
                // Buscar cliente pelo CPF normalizado (remove formatação do banco também)
                existingCliente = await db.cliente.findFirst({
                    where: {
                        empresaId,
                        OR: [
                            { cpf: cpfNormalizado },
                            { cpf: clienteCpf }, // CPF com formatação original
                        ],
                    },
                })

                // Se não encontrou, tenta buscar todos clientes da empresa e comparar CPF normalizado
                if (!existingCliente) {
                    const clientesComCpf = await db.cliente.findMany({
                        where: {
                            empresaId,
                            cpf: { not: null },
                        },
                        select: { id: true, cpf: true },
                    })

                    const clienteEncontrado = clientesComCpf.find(
                        c => c.cpf && c.cpf.replace(/\D/g, '') === cpfNormalizado
                    )

                    if (clienteEncontrado) {
                        existingCliente = await db.cliente.findUnique({
                            where: { id: clienteEncontrado.id },
                        })
                    }
                }
            }

            if (!existingCliente) {
                const telefoneNormalizado = clienteTelefone.replace(/\D/g, '')
                // Buscar cliente pelo telefone normalizado
                existingCliente = await db.cliente.findFirst({
                    where: {
                        empresaId,
                        OR: [
                            { telefone: telefoneNormalizado },
                            { telefone: clienteTelefone }, // Telefone com formatação original
                        ],
                    },
                })

                // Se não encontrou, tenta buscar todos clientes da empresa e comparar telefone normalizado
                if (!existingCliente) {
                    const clientesComTelefone = await db.cliente.findMany({
                        where: {
                            empresaId,
                        },
                        select: { id: true, telefone: true },
                    })

                    const clienteEncontrado = clientesComTelefone.find(
                        c => c.telefone && c.telefone.replace(/\D/g, '') === telefoneNormalizado
                    )

                    if (clienteEncontrado) {
                        existingCliente = await db.cliente.findUnique({
                            where: { id: clienteEncontrado.id },
                        })
                    }
                }
            }

            if (existingCliente) {
                finalClienteId = existingCliente.id
            } else {
                // Create new client
                const novoCliente = await db.cliente.create({
                    data: {
                        nome: clienteNome,
                        telefone: clienteTelefone.replace(/\D/g, ''),
                        cpf: clienteCpf ? clienteCpf.replace(/\D/g, '') : null,
                        email: clienteEmail || null,
                        empresaId,
                    },
                })
                finalClienteId = novoCliente.id
            }
        } else if (!finalClienteId) {
            // Fallback: create a demo client
            const demoCliente = await db.cliente.create({
                data: {
                    nome: "Cliente Demo",
                    telefone: "00000000000",
                    empresaId,
                },
            })
            finalClienteId = demoCliente.id
        }

        // Create the agendamento
        const agendamento = await db.agendamento.create({
            data: {
                data,
                status: "AGENDADO",
                observacoes,
                clienteId: finalClienteId,
                colaboradorId,
                empresaId,
                valor: preco,
                agendamento_itens: {
                    create: {
                        id: crypto.randomUUID(),
                        preco,
                        duracao,
                        servico_id: servicoId,
                        colaborador_id: colaboradorId,
                        atualizado_em: new Date(),
                    },
                },
            },
        })

        // Revalidate paths
        revalidatePath(`/dashboard/agendamentos`)
        revalidatePath(`/dashboard/calendario`)

        return {
            success: true,
            agendamentoId: agendamento.id,
            message: "Agendamento criado com sucesso!"
        }
    } catch (error) {
        console.error("Erro ao criar agendamento:", error)
        return { success: false, error: "Erro ao criar agendamento. Tente novamente." }
    }
}
