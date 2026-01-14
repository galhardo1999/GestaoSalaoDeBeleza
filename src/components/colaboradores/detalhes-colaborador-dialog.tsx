"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, FileText, DollarSign, Briefcase, Clock, CalendarDays, Key } from "lucide-react"
import { buscarDetalhesColaborador } from "@/actions/colaboradores"
import { formatCPF } from "@/lib/utils"

interface DetalhesColaboradorDialogProps {
    children?: React.ReactNode
    colaboradorId: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const DIAS_SEMANA = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda" },
    { value: 2, label: "Terça" },
    { value: 3, label: "Quarta" },
    { value: 4, label: "Quinta" },
    { value: 5, label: "Sexta" },
    { value: 6, label: "Sábado" },
]

export function DetalhesColaboradorDialog({ children, colaboradorId, open: controlledOpen, onOpenChange: controlledOnOpenChange }: DetalhesColaboradorDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    const [colaborador, setColaborador] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && colaboradorId) {
            setLoading(true)
            buscarDetalhesColaborador(colaboradorId)
                .then((data) => {
                    setColaborador(data)
                })
                .finally(() => setLoading(false))
        }
    }, [open, colaboradorId])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Detalhes do Colaborador</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Carregando...</p>
                    </div>
                ) : !colaborador ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Selecione um colaborador para ver os detalhes.</p>
                    </div>
                ) : (
                    <Tabs defaultValue="dados" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="dados">Informações Gerais</TabsTrigger>
                            <TabsTrigger value="horarios">Horários de Trabalho</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto mt-4 px-1">
                            <TabsContent value="dados" className="space-y-6 m-0">
                                {/* Cabeçalho com Foto e Nome */}
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <Avatar className="h-24 w-24 border-4 border-muted">
                                        <AvatarImage src={colaborador.foto || undefined} />
                                        <AvatarFallback className="text-2xl">
                                            {colaborador.nome.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold">{colaborador.nome}</h3>
                                        {colaborador.usuario?.cnpj ? (
                                            <Badge variant="outline" className="mt-1 gap-1">
                                                <Key className="w-3 h-3" /> Login Ativo (CPF)
                                            </Badge>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-1">Sem acesso ao sistema</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-sm font-medium">CPF</span>
                                            </div>
                                            <p className="font-medium">{formatCPF(colaborador.cpf) || "-"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm font-medium">Email</span>
                                            </div>
                                            <p className="font-medium truncate" title={colaborador.email}>{colaborador.email || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm font-medium">Comissão</span>
                                        </div>
                                        {colaborador.comissaoValor ? (
                                            <Badge variant="secondary" className="font-mono text-base">
                                                {colaborador.comissaoTipo === 'PORCENTAGEM'
                                                    ? `${colaborador.comissaoValor}%`
                                                    : `R$ ${Number(colaborador.comissaoValor).toFixed(2)}`}
                                            </Badge>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">Sem comissão definida</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="text-sm font-medium">Serviços Realizados</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {colaborador.servicos && colaborador.servicos.length > 0 ? (
                                                colaborador.servicos.map((s: any) => (
                                                    <Badge key={s.id} variant="outline">{s.nome}</Badge>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Nenhum serviço vinculado.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="horarios" className="space-y-4 m-0">
                                <div className="space-y-2">
                                    {DIAS_SEMANA.map((dia) => {
                                        const horario = colaborador.horarios?.find((h: any) => h.diaSemana === dia.value)
                                        const isOpen = horario?.aberto

                                        return (
                                            <div key={dia.value} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                                <div className="flex items-center gap-3">
                                                    <CalendarDays className={`w-4 h-4 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                                                    <span className="font-medium">{dia.label}</span>
                                                </div>
                                                {isOpen ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                        <span>{horario.horaAbertura}</span>
                                                        <span className="text-muted-foreground">-</span>
                                                        <span>{horario.horaFechamento}</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">Fechado</Badge>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}
