"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const DIAS_SEMANA = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
]

export async function getHorariosFuncionamento(empresaId: string) {
    const horarios = await db.horarioFuncionamento.findMany({
        where: { empresaId },
        orderBy: { diaSemana: 'asc' }
    })

    // Return all days, filling in defaults for missing ones
    return DIAS_SEMANA.map(dia => {
        const existing = horarios.find((h: { diaSemana: number }) => h.diaSemana === dia.value)
        return existing || {
            id: null,
            diaSemana: dia.value,
            aberto: dia.value !== 0, // Default: closed on Sunday
            horaAbertura: "09:00",
            horaFechamento: "18:00",
            empresaId
        }
    })
}

interface HorarioInput {
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
}

export async function updateHorariosFuncionamento(horarios: HorarioInput[]) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.empresaId) {
        return { success: false, error: "Usuário não autorizado" }
    }

    const empresaId = session.user.empresaId

    try {
        // Use upsert for each day
        for (const horario of horarios) {
            await db.horarioFuncionamento.upsert({
                where: {
                    empresaId_diaSemana: {
                        empresaId,
                        diaSemana: horario.diaSemana
                    }
                },
                update: {
                    aberto: horario.aberto,
                    horaAbertura: horario.aberto ? horario.horaAbertura : null,
                    horaFechamento: horario.aberto ? horario.horaFechamento : null
                },
                create: {
                    empresaId,
                    diaSemana: horario.diaSemana,
                    aberto: horario.aberto,
                    horaAbertura: horario.aberto ? horario.horaAbertura : null,
                    horaFechamento: horario.aberto ? horario.horaFechamento : null
                }
            })
        }

        revalidatePath("/dashboard/configuracoes")
        return { success: true }
    } catch (error) {
        console.error("Error updating horarios:", error)
        return { success: false, error: "Erro ao salvar horários" }
    }
}
