"use client"

import { useState, useMemo, useDeferredValue } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Search, MoreHorizontal, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FinancialMovement {
    id: string
    data: Date
    cliente: string
    servico: string
    colaborador: string
    comissao: number
    valor: number
    status: string
}

interface FinancialMovementsTableProps {
    data: FinancialMovement[]
}

const statusMap: Record<string, { label: string, color: string, bg: string }> = {
    'AGENDADO': { label: 'Agendado', color: 'text-blue-700', bg: 'bg-blue-50' },
    'PENDENTE': { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50' },
    'CONCLUIDO': { label: 'Concluído', color: 'text-green-700', bg: 'bg-green-50' },
    'CANCELADO': { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50' },
    'NAO_COMPARECEU': { label: 'Não Compareceu', color: 'text-gray-700', bg: 'bg-gray-100' },
}

// P1: Memoized currency formatter
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
})

export function FinancialMovementsTable({ data }: FinancialMovementsTableProps) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    // P1: Deferred value for smoother search UX on large datasets
    const deferredSearch = useDeferredValue(search)

    // P1: Memoized filtering to avoid recalculation on every render
    const filteredData = useMemo(() => {
        if (!deferredSearch && !statusFilter) return data

        const searchLower = deferredSearch.toLowerCase()

        return data.filter(item => {
            if (statusFilter && item.status !== statusFilter) return false
            if (searchLower && !item.cliente.toLowerCase().includes(searchLower)) return false
            return true
        })
    }, [data, deferredSearch, statusFilter])

    const formatCurrency = (value: number) => currencyFormatter.format(value)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-white"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 gap-2 bg-white">
                                <Filter className="h-4 w-4" />
                                Status
                                {statusFilter && <Badge variant="secondary" className="ml-1 h-5 px-1">{statusMap[statusFilter]?.label}</Badge>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === null}
                                onCheckedChange={() => setStatusFilter(null)}
                            >
                                Todos
                            </DropdownMenuCheckboxItem>
                            {Object.entries(statusMap)
                                .filter(([key]) => ['CONCLUIDO', 'PENDENTE'].includes(key))
                                .map(([key, config]) => (
                                    <DropdownMenuCheckboxItem
                                        key={key}
                                        checked={statusFilter === key}
                                        onCheckedChange={() => setStatusFilter(key === statusFilter ? null : key)}
                                    >
                                        {config.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-gray-100 hover:bg-transparent">
                            <TableHead className="w-[100px]">Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Comissão</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                                    Nenhum movimento encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((movement) => (
                                <TableRow key={movement.id} className="border-b-gray-50 hover:bg-gray-50/50">
                                    <TableCell className="font-medium text-gray-600">
                                        {format(movement.data, 'dd/MM', { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {movement.cliente}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {movement.servico}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {movement.colaborador}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {formatCurrency(movement.comissao)}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        {formatCurrency(movement.valor)}
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold max-w-fit transition-colors",
                                            statusMap[movement.status]?.bg || 'bg-gray-100',
                                            statusMap[movement.status]?.color || 'text-gray-700'
                                        )}>
                                            {statusMap[movement.status]?.label || movement.status}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { }}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { }} className="text-red-600">
                                                    Estornar/Cancelar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-xs text-gray-500">
                    Mostrando {filteredData.length} de {data.length} registros
                </div>
            </div>
        </div>
    )
}
