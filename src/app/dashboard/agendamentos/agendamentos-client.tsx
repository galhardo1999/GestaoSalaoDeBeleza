"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Plus, Trash2, Calendar as CalendarIcon, X, MessageCircle, CalendarClock, Check } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Importações do sistema existente
import { NovoAgendamentoDialog } from "@/components/forms/agendamentos/novo-agendamento-dialog"
import { BotaoCancelarAgendamento } from "@/components/forms/agendamentos/botao-cancelar-agendamento"
import { ReagendarDialog } from "@/components/forms/agendamentos/reagendar-dialog"
import { WhatsAppButton } from "@/components/dashboard/whatsapp-button"
import { BotaoConfirmarAgendamento } from "@/components/forms/agendamentos/botao-confirmar-agendamento"
import { BotaoConcluirAgendamento } from "@/components/forms/agendamentos/botao-concluir-agendamento"

interface AgendamentoData {
    id: string
    data: Date
    status: string
    cliente: { nome: string; telefone: string }
    servico: { nome: string; preco: number }
    colaborador: { id: string; nome: string } | null
}

interface AgendamentosClientProps {
    initialAgendamentos: AgendamentoData[]
    clientes: any[]
    servicos: any[]
    colaboradores: any[]
    whatsappTemplate?: string | null
    filteredDate?: string | null
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    AGENDADO: { label: "Confirmado", variant: "default", className: "bg-teal-500 hover:bg-teal-600" }, // Mapeando estilo 'Confirmado' para AGENDADO
    PENDENTE: { label: "Pendente", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    CANCELADO: { label: "Cancelado", variant: "destructive", className: "" },
    CONCLUIDO: { label: "Concluído", variant: "outline", className: "border-slate-500 text-slate-600" },
    NAO_COMPARECEU: { label: "Não Compareceu", variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200" },
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function AgendamentosClient({
    initialAgendamentos,
    clientes,
    servicos,
    colaboradores,
    whatsappTemplate,
    filteredDate
}: AgendamentosClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // --- Estado Local para UI ---
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("todos")
    const [collaboratorFilter, setCollaboratorFilter] = useState("todos")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    // --- Filtro de Data (Cliente) ---
    // Padrão para Hoje se não houver filtros
    const [dateFilter, setDateFilter] = useState<Date | undefined>(
        new Date() // Padrão para hoje, já que buscamos TODO o histórico.
    )

    // --- Estado Derivado (Filtragem Client-Side) ---
    const filteredAgendamentos = useMemo(() => {
        return initialAgendamentos.filter(agendamento => {
            // Filtrar por Termo de Busca
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                agendamento.cliente.nome.toLowerCase().includes(searchLower) ||
                agendamento.servico.nome.toLowerCase().includes(searchLower)

            // Filtrar por Status
            const matchesStatus = statusFilter === "todos" || agendamento.status === statusFilter

            // Filtrar por Colaborador
            const matchesCollaborator = collaboratorFilter === "todos" || agendamento.colaborador?.id === collaboratorFilter

            // Filtrar por Data
            // ... (lógica de data existente) ...
            let matchesDate = true
            if (dateFilter) {
                const apptDate = new Date(agendamento.data)
                // Ajustar para fuso horário se necessário, mas isSameDay lida com comparação de data local geralmente.
                // No entanto, apptDate é UTC do DB. dateFilter é Local do Calendário.
                // Precisamos comparar "Parte do dia no Brasil".
                // Hack: Comparar strings formatadas "YYYY-MM-DD".
                const apptDateStr = format(apptDate, "yyyy-MM-dd")
                const filterDateStr = format(dateFilter, "yyyy-MM-dd")
                matchesDate = apptDateStr === filterDateStr
            }

            return matchesSearch && matchesStatus && matchesDate && matchesCollaborator
        })
    }, [initialAgendamentos, searchTerm, statusFilter, dateFilter, collaboratorFilter])

    // --- Lógica de Paginação ---
    const totalItems = filteredAgendamentos.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Redefinir página quando filtros mudam
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter, itemsPerPage, dateFilter, collaboratorFilter])

    const currentAgendamentos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAgendamentos.slice(start, start + itemsPerPage)
    }, [filteredAgendamentos, currentPage, itemsPerPage])


    // --- Manipuladores ---

    // Removido updateDateUrl inteiramente pois não queremos recarregamento do servidor.
    // Opcionalmente poderíamos window.history.replaceState para manter URL sincronizada sem recarregar.
    // Por enquanto, mais simples é puramente local.

    const clearDateFilter = () => {
        setDateFilter(undefined) // Mostra TODO o histórico se indefinido
    }

    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    return (
        <div className="p-8 space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">
                        Agendamentos
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie todos os agendamentos do salão (Visualização Diária)
                    </p>
                </div>
                <div className="flex gap-2">
                    <NovoAgendamentoDialog clientes={clientes} servicos={servicos} colaboradores={colaboradores} />
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente ou serviço..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-white"
                    />
                </div>

                {/* Filtro de Data (Cliente) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="relative">
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full sm:w-[200px] justify-start text-left font-normal bg-white pr-8", // Adicionado pr-8 para espaço do ícone
                                    !dateFilter && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFilter ? format(dateFilter, "dd/MM/yyyy", { locale: ptBR }) : "Todos os períodos"}
                            </Button>
                            {dateFilter && (
                                <div
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation() // Impedir abertura do popover
                                        clearDateFilter()
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={(date) => {
                                setDateFilter(date)
                            }}
                            initialFocus
                            locale={ptBR}
                            className="p-3 pointer-events-auto"
                        />
                    </PopoverContent>
                </Popover>

                {/* Filtro de Status (Cliente) */}
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px] bg-white">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="AGENDADO">Confirmado</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                        <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        <SelectItem value="NAO_COMPARECEU">Não Compareceu</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filtro de Colaborador (Cliente) */}
                <Select
                    value={collaboratorFilter}
                    onValueChange={(value) => setCollaboratorFilter(value)}
                >
                    <SelectTrigger className="w-full sm:w-[200px] bg-white">
                        <SelectValue placeholder="Filtrar por colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os colaboradores</SelectItem>
                        {colaboradores.map((colaborador) => (
                            <SelectItem key={colaborador.id} value={colaborador.id}>
                                {colaborador.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tabela */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Data</TableHead>
                            <TableHead className="w-[80px]">Hora</TableHead>
                            <TableHead className="min-w-[180px]">Cliente</TableHead>
                            <TableHead className="min-w-[150px]">Serviço</TableHead>
                            <TableHead className="min-w-[150px]">Colaborador</TableHead>
                            <TableHead className="w-[100px]">Preço</TableHead>
                            <TableHead className="w-[140px]">Status</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentAgendamentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="w-8 h-8" />
                                        <p>Nenhum agendamento encontrado</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentAgendamentos.map((appointment) => {
                                const status = statusConfig[appointment.status] || { label: appointment.status, variant: "default", className: "" }
                                return (
                                    <TableRow key={appointment.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(appointment.data), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>{format(new Date(appointment.data), "HH:mm")}</TableCell>
                                        <TableCell>{appointment.cliente.nome}</TableCell>
                                        <TableCell>{appointment.servico.nome}</TableCell>
                                        <TableCell>{appointment.colaborador?.nome || '-'}</TableCell>
                                        <TableCell>{formatCurrency(appointment.servico.preco)}</TableCell>
                                        <TableCell>
                                            <Badge className={status.className} variant={status.variant}>
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* PENDENTE: Confirmar, Whatsapp, Reagendar, Cancelar */}
                                                {appointment.status === 'PENDENTE' && (
                                                    <>
                                                        <BotaoConfirmarAgendamento id={appointment.id}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50" title="Confirmar">
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        </BotaoConfirmarAgendamento>

                                                        <WhatsAppButton
                                                            phone={appointment.cliente.telefone}
                                                            clientName={appointment.cliente.nome}
                                                            date={new Date(appointment.data)}
                                                            serviceName={appointment.servico.nome}
                                                            messageTemplate={whatsappTemplate}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        />

                                                        <ReagendarDialog id={appointment.id} currentDate={new Date(appointment.data)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-blue-600" title="Reagendar">
                                                                <CalendarClock className="w-4 h-4" />
                                                            </Button>
                                                        </ReagendarDialog>

                                                        <BotaoCancelarAgendamento id={appointment.id}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                                                                title="Cancelar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </BotaoCancelarAgendamento>
                                                    </>
                                                )}

                                                {/* AGENDADO (Confirmado): Reagendar, Cancelar */}
                                                {appointment.status === 'AGENDADO' && (
                                                    <>
                                                        <BotaoConcluirAgendamento id={appointment.id} />
                                                        <ReagendarDialog id={appointment.id} currentDate={new Date(appointment.data)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-blue-600" title="Reagendar">
                                                                <CalendarClock className="w-4 h-4" />
                                                            </Button>
                                                        </ReagendarDialog>
                                                        <BotaoCancelarAgendamento id={appointment.id}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                                                                title="Cancelar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </BotaoCancelarAgendamento>
                                                    </>
                                                )}

                                                {/* NAO_COMPARECEU: Confirmar, Reagendar, Cancelar */}
                                                {appointment.status === 'NAO_COMPARECEU' && (
                                                    <>
                                                        <BotaoConfirmarAgendamento id={appointment.id}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50" title="Confirmar">
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        </BotaoConfirmarAgendamento>

                                                        <ReagendarDialog id={appointment.id} currentDate={new Date(appointment.data)}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-blue-600" title="Reagendar">
                                                                <CalendarClock className="w-4 h-4" />
                                                            </Button>
                                                        </ReagendarDialog>

                                                        <BotaoCancelarAgendamento id={appointment.id}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                                                                title="Cancelar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </BotaoCancelarAgendamento>
                                                    </>
                                                )}

                                                {/* CANCELADO: Nenhum icone */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Itens por página:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            // Sem atualização de URL, apenas client-side
                        }}
                    >
                        <SelectTrigger className="w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option.toString()}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {totalPages > 1 && (
                    <Pagination className="justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={cn(
                                        "cursor-pointer",
                                        currentPage === 1 && "pointer-events-none opacity-50"
                                    )}
                                    size="default"
                                />
                            </PaginationItem>

                            {/* Lógica de paginação simples por brevidade.
                                Em produção, preferir renderizar um intervalo refinado (ex: 1, ..., 4, 5, 6, ..., 10)
                                se houver muitas páginas. Implementação mantida simples conforme comportamento original.
                             */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                        size="icon"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={cn(
                                        "cursor-pointer",
                                        currentPage === totalPages && "pointer-events-none opacity-50"
                                    )}
                                    size="default"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Resumo */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                    Mostrando {currentAgendamentos.length} de {totalItems} agendamentos (Total Filtrado)
                </span>
                <span>
                    Total desta página:{" "}
                    <span className="font-semibold text-foreground">
                        {formatCurrency(
                            currentAgendamentos.reduce((acc, a) => acc + Number(a.servico.preco), 0)
                        )}
                    </span>
                </span>
            </div>
        </div>
    )
}
