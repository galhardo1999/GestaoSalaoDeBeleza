"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Scissors, Clock, DollarSign, Calendar } from "lucide-react"

interface ServicoDetalhes {
    id: string
    nome: string
    preco: number
    duracao: number // em minutos (ServicoClient usa 'duracao' não 'duracaoMin')
    agendamentos: number
}

interface DetalhesServicoDialogProps {
    children?: React.ReactNode
    servico: ServicoDetalhes
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DetalhesServicoDialog({ children, servico, open, onOpenChange }: DetalhesServicoDialogProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price)
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`
        }
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        if (remainingMinutes === 0) {
            return `${hours}h`
        }
        return `${hours}h ${remainingMinutes}min`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Detalhes do Serviço</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Cabeçalho */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Scissors className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl">{servico.nome}</h3>
                            <Badge variant="outline" className="mt-1">
                                Serviço ID: {servico.id.substring(0, 8)}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-sm font-medium">Preço</span>
                            </div>
                            <span className="font-semibold text-lg">{formatPrice(servico.preco)}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-dashed pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Duração</span>
                            </div>
                            <span className="font-medium">{formatDuration(servico.duracao)}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-dashed pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">Total de Agendamentos</span>
                            </div>
                            <Badge variant="secondary">{servico.agendamentos}</Badge>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
