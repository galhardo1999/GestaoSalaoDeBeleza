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
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function ClientesClient({ clientes }: ClientesClientProps) {
    const router = useRouter()

    // --- Estado Local ---
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    // --- Filtragem ---
    const filteredClientes = useMemo(() => {
        const term = searchTerm.toLowerCase()
        if (!term) return clientes

        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(term) ||
            cliente.email?.toLowerCase().includes(term) ||
            cliente.cpf.includes(term) ||
            cliente.codigo.includes(term) ||
            cliente.telefone.includes(term)
        )
    }, [clientes, searchTerm])

    // --- Paginação ---
    const totalItems = filteredClientes.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const currentClientes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredClientes.slice(start, start + itemsPerPage)
    }, [filteredClientes, currentPage, itemsPerPage])

    // Redefinir para página 1 ao mudar filtro
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, itemsPerPage])


    // --- Manipuladores ---
    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    return (
        <div className="p-8 space-y-6">
            {/* Cabeçalho */}
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

            {/* Filtros */}
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

            {/* Tabela */}
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
                        {currentClientes.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum cliente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentClientes.map((cliente) => (
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

            {/* Paginação */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Itens por página:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value))
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
            <div className="text-sm text-muted-foreground">
                Exibindo {currentClientes.length} de {totalItems} clientes (Total Filtrado)
            </div>
        </div>
    )
}
