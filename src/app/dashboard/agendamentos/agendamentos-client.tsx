"use client"

import { useState, useEffect } from "react"
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

// Imports from existing system
import { NovoAgendamentoDialog } from "@/components/forms/agendamentos/novo-agendamento-dialog"
import { BotaoCancelarAgendamento } from "@/components/forms/agendamentos/botao-cancelar-agendamento"
import { ReagendarDialog } from "@/components/forms/agendamentos/reagendar-dialog"
import { WhatsAppButton } from "@/components/dashboard/whatsapp-button"
import { BotaoConfirmarAgendamento } from "@/components/forms/agendamentos/botao-confirmar-agendamento"

interface AgendamentoData {
    id: string
    data: Date
    status: string
    cliente: { nome: string; telefone: string }
    servico: { nome: string; preco: number }
    colaborador: { nome: string } | null
}

interface AgendamentosClientProps {
    agendamentos: AgendamentoData[]
    clientes: any[]
    servicos: any[]
    colaboradores: any[]
    pagination: {
        currentPage: number
        totalPages: number
        itemsPerPage: number
        totalItems: number
    }
    whatsappTemplate?: string | null
    filteredDate: string | null
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    AGENDADO: { label: "Confirmado", variant: "default", className: "bg-teal-500 hover:bg-teal-600" }, // Mapping 'Confirmado' style to AGENDADO
    PENDENTE: { label: "Pendente", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    CANCELADO: { label: "Cancelado", variant: "destructive", className: "" },
    CONCLUIDO: { label: "Concluído", variant: "outline", className: "border-slate-500 text-slate-600" },
    NAO_COMPARECEU: { label: "Não Compareceu", variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200" },
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function AgendamentosClient({
    agendamentos,
    clientes,
    servicos,
    colaboradores,
    pagination,
    whatsappTemplate,
    filteredDate
}: AgendamentosClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "todos")

    // Initialize date filter:
    // 1. If URL has date, use it.
    // 2. If props.filteredDate is present (and not null), use it.
    // 3. Else undefined.
    // Note: filteredDate from server handles the "default to today" logic.
    // If URL is empty, server sends today's date in filteredDate.
    // If URL is 'all', server sends null in filteredDate.
    const [dateFilter, setDateFilter] = useState<Date | undefined>(
        searchParams.get("date") && searchParams.get("date") !== 'all'
            ? new Date(searchParams.get("date")!)
            : (filteredDate ? new Date(`${filteredDate}T12:00:00`) : undefined) // T12:00:00 to avoid timezone shift on client parsing YYYY-MM-DD
    )
    const [itemsPerPage, setItemsPerPage] = useState(pagination.itemsPerPage)

    // Sync local state with URL params on change
    const updateUrl = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        // Reset page to 1 on filter change
        if (key !== "page") {
            params.set("page", "1")
        }
        router.push(`?${params.toString()}`)
    }

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }
        params.set("page", "1")
        router.replace(`?${params.toString()}`) // Using replace for search typing
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", page.toString())
            router.push(`?${params.toString()}`)
        }
    }

    const clearDateFilter = () => {
        setDateFilter(undefined)
        updateUrl("date", "all")
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">
                        Agendamentos
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie todos os agendamentos do salão
                    </p>
                </div>
                <div className="flex gap-2">
                    <NovoAgendamentoDialog clientes={clientes} servicos={servicos} colaboradores={colaboradores} />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente ou serviço..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Date Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full sm:w-[200px] justify-start text-left font-normal",
                                !dateFilter && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "dd/MM/yyyy", { locale: ptBR }) : "Filtrar por data"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={(date) => {
                                setDateFilter(date)
                                updateUrl("date", date ? date.toISOString() : null)
                            }}
                            initialFocus
                            locale={ptBR}
                            className="p-3 pointer-events-auto"
                        />
                    </PopoverContent>
                </Popover>

                {dateFilter && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearDateFilter}
                        className="shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}

                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value)
                        updateUrl("status", value === "todos" ? null : value)
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
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
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agendamentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="w-8 h-8" />
                                        <p>Nenhum agendamento encontrado</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            agendamentos.map((appointment) => {
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Itens por página:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            // In a real server-side implementation, we would update the URL param for itemsPerPage if supported.
                            // For now we'll stick to fixed or just trigger reload if needed. The current backend is hardcoded to 10?
                            // The original page had hardcoded 10. We should ideally update the URL via `limit` param.
                            // Logic: updateUrl('limit', value)
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

                {pagination.totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className={cn(
                                        "cursor-pointer",
                                        pagination.currentPage === 1 && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(page)}
                                        isActive={pagination.currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className={cn(
                                        "cursor-pointer",
                                        pagination.currentPage === pagination.totalPages && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                    Mostrando {agendamentos.length} de {pagination.totalItems} agendamentos
                </span>
                {/* Total Price Sum is tricky with server-side pagination. We only have current page items. 
            We can show the sum of *current page* or request a total sum from backend. 
            For now, showing sum of current page as per design behavior on client mock. */}
                <span>
                    Total desta página:{" "}
                    <span className="font-semibold text-foreground">
                        {formatCurrency(
                            agendamentos.reduce((acc, a) => acc + Number(a.servico.preco), 0)
                        )}
                    </span>
                </span>
            </div>
        </div>
    )
}
