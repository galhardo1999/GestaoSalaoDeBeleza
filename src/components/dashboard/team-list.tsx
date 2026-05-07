"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

type ServicoEquipe = {
    nome: string
}

type AgendamentoEquipe = {
    data: string
    valor: number | null
    servico: {
        nome: string
        duracaoMin: number
    } | null
    cliente: {
        nome: string
    } | null
}

type ColaboradorEquipe = {
    id: string
    nome: string
    foto: string | null
    servicos: ServicoEquipe[]
    agendamentos: AgendamentoEquipe[]
}

type TeamListProps = {
    colaboradores: ColaboradorEquipe[]
}

export function TeamList({ colaboradores }: TeamListProps) {
    const desempenho = colaboradores.map((colaborador) => {
        const atendimentos = colaborador.agendamentos.length
        const receita = colaborador.agendamentos.reduce((sum, apt) => sum + Number(apt.valor || 0), 0)
        
        // Ex: 8 horas diárias (480 min)
        const tempoTotalMin = colaborador.agendamentos.reduce((sum, apt) => sum + (apt.servico?.duracaoMin || 30), 0)
        const ocupacao = Math.min(Math.round((tempoTotalMin / 480) * 100), 100)

        return {
            ...colaborador,
            atendimentos,
            receita,
            ocupacao
        }
    }).sort((a, b) => b.receita - a.receita) // Sort by highest revenue

    // Mapeamento de cores para as barras de progresso (apenas para variar visualmente)
    const getBarColor = (index: number) => {
        const colors = ["bg-[#7B61FF]", "bg-[#4ADE80]", "bg-[#3B82F6]", "bg-[#F97316]", "bg-[#EC4899]"]
        return colors[index % colors.length]
    }

    return (
        <Card className="rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 p-5 border-b border-dashboard-border">
                <Users className="h-4 w-4 text-dashboard-subtle" />
                <h2 className="font-heading text-[15px] font-semibold text-dashboard-foreground">Desempenho dos colaboradores hoje</h2>
            </div>
            
            <CardContent className="p-0">
                <div className="px-5 py-2 space-y-1">
                    {desempenho.map((colaborador, index) => (
                        <div
                            key={colaborador.id}
                            className="flex items-center justify-between gap-4 py-3 border-b border-dashboard-border last:border-0 hover:bg-dashboard-surface-hover -mx-5 px-5 transition-colors"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar className="h-9 w-9 border border-dashboard-border">
                                    <AvatarImage src={colaborador.foto || undefined} />
                                    <AvatarFallback className="bg-[#EAEAEA] text-dashboard-primary-foreground font-bold text-[11px]">
                                        {colaborador.nome.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-bold text-dashboard-foreground">{colaborador.nome}</p>
                                    <p className="mt-0.5 truncate text-[11px] font-medium text-dashboard-muted">
                                        {colaborador.atendimentos} atend. - R$ {colaborador.receita.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 w-24">
                                <div className="h-1.5 w-full bg-dashboard-surface-hover rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${getBarColor(index)}`} 
                                        style={{ width: `${colaborador.ocupacao}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold text-dashboard-subtle">
                                    {colaborador.ocupacao}%
                                </span>
                            </div>
                        </div>
                    ))}

                    {desempenho.length === 0 && (
                        <div className="flex h-full items-center justify-center p-8 text-center text-dashboard-muted">
                            <p className="text-sm font-medium">Nenhum colaborador encontrado.</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-dashboard-border">
                    <Button variant="outline" className="w-full h-10 border-dashboard-border bg-transparent text-dashboard-muted hover:bg-dashboard-surface-hover hover:text-dashboard-primary hover:border-dashboard-primary/50 rounded-[8px] text-[13px] font-semibold transition-colors">
                        Ver comissões do mês
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
