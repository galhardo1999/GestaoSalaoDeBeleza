"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { NovoClienteDialog } from "@/components/forms/clientes/novo-cliente-dialog"
import { DetalhesClienteDialog } from "@/components/clientes/detalhes-cliente-dialog"
import { EditarClienteDialog } from "@/components/forms/clientes/editar-cliente-dialog"
import { BotaoExcluirCliente } from "@/components/forms/clientes/botao-excluir-cliente"

interface ClienteData {
    id: string
    codigo: string
    nome: string
    cpf: string
    telefone: string
    agendamentos: number
    ultimoAgendamento: string
    email: string | null
    observacoes: string | null
}

interface ClientesClientProps {
    clientes: ClienteData[]
    pagination: {
        currentPage: number
        totalPages: number
        itemsPerPage: number
        totalItems: number
    }
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function ClientesClient({ clientes, pagination }: ClientesClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const [itemsPerPage, setItemsPerPage] = useState(pagination.itemsPerPage)

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }
        params.set("page", "1")
        router.replace(`?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", page.toString())
            router.push(`?${params.toString()}`)
        }
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-playfair text-2xl font-semibold text-foreground md:text-3xl">
                        Clientes
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gerencie seus clientes
                    </p>
                </div>
                <NovoClienteDialog>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Cliente
                    </Button>
                </NovoClienteDialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, CPF, código ou telefone..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead className="text-center">Agendamentos</TableHead>
                            <TableHead>Último Agendamento</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientes.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum cliente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clientes.map((cliente) => (
                                <TableRow key={cliente.id}>
                                    <TableCell className="font-medium">
                                        {cliente.codigo}
                                    </TableCell>
                                    <TableCell>{cliente.nome}</TableCell>
                                    <TableCell>{cliente.cpf}</TableCell>
                                    <TableCell>{cliente.telefone}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                            {cliente.agendamentos}
                                        </span>
                                    </TableCell>
                                    <TableCell>{cliente.ultimoAgendamento}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <DetalhesClienteDialog clienteId={cliente.id}>
                                                <Button variant="ghost" size="icon" title="Visualizar">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DetalhesClienteDialog>
                                            <EditarClienteDialog cliente={cliente}>
                                                <Button variant="ghost" size="icon" title="Editar">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </EditarClienteDialog>
                                            <BotaoExcluirCliente id={cliente.id}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Excluir"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </BotaoExcluirCliente>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
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
                            // Would update URL logic in real scenario
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
            <div className="text-sm text-muted-foreground">
                Exibindo {clientes.length} de {pagination.totalItems} clientes
            </div>
        </div>
    )
}
