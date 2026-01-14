"use client"

import { useState, useEffect } from "react"
import { addMinutes, isWithinInterval } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TeamListProps {
    colaboradores: any[] // Using any for simplicity with complex Prisma types, can refine later
}

export function TeamList({ colaboradores }: TeamListProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        // Update every 30 seconds to be responsive
        const interval = setInterval(() => {
            setNow(new Date())
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const teamStatus = colaboradores.map(colaborador => {
        const currentAppointment = colaborador.agendamentos.find((apt: any) => {
            const start = new Date(apt.data)
            const duration = apt.servico?.duracaoMin || 30
            const end = addMinutes(start, duration)
            return isWithinInterval(now, { start, end })
        })

        if (currentAppointment) {
            return {
                ...colaborador,
                status: 'ATENDENDO',
                clientName: currentAppointment.cliente?.nome || 'Cliente',
                serviceName: currentAppointment.servico?.nome || 'Serviço'
            }
        }

        return {
            ...colaborador,
            status: 'DISPONIVEL',
            clientName: null,
            serviceName: null
        }
    })

    const availableCount = teamStatus.filter((c: any) => c.status === 'DISPONIVEL').length

    return (
        <Card className="bg-white h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl font-serif">Equipe</CardTitle>
                    <p className="text-sm text-gray-500">Status em tempo real</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {availableCount} disponíveis
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {teamStatus.map((member: any) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl border p-4 bg-gray-50/50 gap-4"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={member.foto || undefined} />
                                    <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                                        {member.nome.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className={cn(
                                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                                    member.status === 'ATENDENDO' ? "bg-amber-400" : "bg-emerald-400"
                                )} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 truncate">{member.nome}</p>
                                <p className="text-sm text-gray-500 truncate">
                                    {member.servicos && member.servicos.length > 0
                                        ? member.servicos.map((s: any) => s.nome).join(', ')
                                        : 'Sem serviços'}
                                </p>
                            </div>
                        </div>

                        {member.status === 'ATENDENDO' ? (
                            <div className="text-right flex-shrink-0">
                                <div className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Atendendo
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    com {member.clientName?.split(' ')[0]}
                                </p>
                            </div>
                        ) : (
                            <div className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 flex-shrink-0">
                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Disponível
                            </div>
                        )}
                    </div>
                ))}

                {teamStatus.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        Nenhum colaborador encontrado.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
