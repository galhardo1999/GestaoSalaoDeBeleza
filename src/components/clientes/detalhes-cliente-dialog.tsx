"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Phone, MapPin, FileText, History } from "lucide-react"
import { buscarDetalhesCliente } from "@/actions/clientes"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DetalhesClienteDialogProps {
    children?: React.ReactNode
    clienteId: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const formatStatus = (status: string) => {
    switch (status) {
        case "NAO_COMPARECEU":
            return "Não Compareceu"
        case "CONCLUIDO":
            return "Concluído"
        case "CANCELADO":
            return "Cancelado"
        case "AGENDADO":
            return "Agendado"
        case "PENDENTE":
            return "Pendente"
        default:
            return status
    }
}

export function DetalhesClienteDialog({ children, clienteId, open: controlledOpen, onOpenChange: controlledOnOpenChange }: DetalhesClienteDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    const [cliente, setCliente] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && clienteId) {
            setLoading(true)
            buscarDetalhesCliente(clienteId)
                .then((data) => {
                    setCliente(data)
                })
                .finally(() => setLoading(false))
        }
    }, [open, clienteId])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Detalhes do Cliente</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Carregando...</p>
                    </div>
                ) : !cliente ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500">Erro ao carregar dados do cliente.</p>
                    </div>
                ) : (
                    <Tabs defaultValue="dados" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="dados">Dados do Cliente</TabsTrigger>
                            <TabsTrigger value="observacoes">Observações</TabsTrigger>
                            <TabsTrigger value="historico">Histórico</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto mt-4 px-1">
                            <TabsContent value="dados" className="space-y-6 m-0 h-full">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Código</p>
                                        <p className="font-medium">{cliente.codigo}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Nome</p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-lg font-medium">{cliente.nome}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">CPF</p>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{cliente.cpf || "-"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{cliente.telefone}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p>{cliente.email || "-"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Cliente desde {format(new Date(cliente.criadoEm), "dd/MM/yyyy")}
                                    </div>
                                    <div className="text-sm font-medium">
                                        Total de Agendamentos: {cliente._count?.agendamentos || cliente.agendamentos?.length || 0}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="observacoes" className="space-y-4 m-0 h-full">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                                    <div className="p-4 bg-muted rounded-md text-sm min-h-[200px] whitespace-pre-wrap">
                                        {cliente.observacoes || "Nenhuma observação registrada."}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="historico" className="space-y-4 m-0 h-full">
                                {cliente.agendamentos && cliente.agendamentos.length > 0 ? (
                                    <div className="rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Serviço</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Profissional</th>
                                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cliente.agendamentos.map((agendamento: any) => (
                                                    <tr key={agendamento.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <td className="p-4 align-middle">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                {format(new Date(agendamento.data), "dd/MM/yyyy HH:mm")}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 align-middle font-medium">
                                                            {agendamento.agendamento_itens?.[0]?.servicos?.nome || "Serviço Removido"}
                                                        </td>
                                                        <td className="p-4 align-middle">
                                                            {agendamento.usuario?.nome || "-"}
                                                        </td>
                                                        <td className="p-4 align-middle">
                                                            <Badge variant={
                                                                agendamento.status === "CONCLUIDO" ? "default" :
                                                                    agendamento.status === "CANCELADO" || agendamento.status === "NAO_COMPARECEU" ? "destructive" :
                                                                        "outline"
                                                            }>
                                                                {formatStatus(agendamento.status)}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                                        <History className="h-8 w-8 text-muted-foreground/50" />
                                        <p className="text-muted-foreground">Nenhum agendamento encontrado para este cliente.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}
