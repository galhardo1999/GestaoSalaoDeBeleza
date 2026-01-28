"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { updateHorariosFuncionamento } from "@/actions/horarios-funcionamento"

const DIAS_SEMANA = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
]

interface Horario {
    id?: string | null
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
}

interface HorariosFuncionamentoFormProps {
    initialData: Horario[]
}

export function HorariosFuncionamentoForm({ initialData }: HorariosFuncionamentoFormProps) {
    const [horarios, setHorarios] = useState<Horario[]>(initialData)
    const [isPending, setIsPending] = useState(false)

    const handleToggle = (diaSemana: number, aberto: boolean) => {
        setHorarios(prev => prev.map(h =>
            h.diaSemana === diaSemana ? { ...h, aberto } : h
        ))
    }

    const handleTimeChange = (diaSemana: number, field: 'horaAbertura' | 'horaFechamento', value: string) => {
        setHorarios(prev => prev.map(h =>
            h.diaSemana === diaSemana ? { ...h, [field]: value } : h
        ))
    }

    const handleSubmit = async () => {
        setIsPending(true)
        try {
            // Normalize horarios: ensure horaAbertura/horaFechamento have values when aberto is true
            const normalizedHorarios = horarios.map(h => ({
                ...h,
                horaAbertura: h.aberto ? (h.horaAbertura || "09:00") : null,
                horaFechamento: h.aberto ? (h.horaFechamento || "18:00") : null,
            }))

            const result = await updateHorariosFuncionamento(normalizedHorarios)
            if (result.success) {
                alert("Horários salvos com sucesso!")
            } else {
                alert("Erro ao salvar: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Erro inesperado ao salvar horários.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {horarios.map((horario) => {
                    const diaInfo = DIAS_SEMANA.find(d => d.value === horario.diaSemana)

                    return (
                        <div
                            key={horario.diaSemana}
                            className="flex items-center gap-4 p-4 rounded-xl border bg-white"
                        >
                            <div className="w-40">
                                <span className="font-medium text-gray-900">
                                    {diaInfo?.label}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={horario.aberto}
                                    onCheckedChange={(checked: boolean) => handleToggle(horario.diaSemana, checked)}
                                />
                                <span className={`text-sm ${horario.aberto ? 'text-green-600' : 'text-gray-400'}`}>
                                    {horario.aberto ? 'Aberto' : 'Fechado'}
                                </span>
                            </div>

                            {horario.aberto && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <Input
                                        type="time"
                                        value={horario.horaAbertura || "09:00"}
                                        onChange={(e) => handleTimeChange(horario.diaSemana, 'horaAbertura', e.target.value)}
                                        className="w-32"
                                    />
                                    <span className="text-gray-500">até</span>
                                    <Input
                                        type="time"
                                        value={horario.horaFechamento || "18:00"}
                                        onChange={(e) => handleTimeChange(horario.diaSemana, 'horaFechamento', e.target.value)}
                                        className="w-32"
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Horários"}
                </Button>
            </div>
        </div>
    )
}
