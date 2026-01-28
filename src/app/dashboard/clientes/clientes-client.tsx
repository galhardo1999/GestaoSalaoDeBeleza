"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
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
import { cn, formatCPF, formatTelefone } from "@/lib/utils"

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
    dataNascimento: Date | null
}

interface ClientesClientProps {
    clientes: ClienteData[]
    currentPage: number
    totalPages: number
    totalCount: number
    initialSearch: string
    itemsPerPage: number
}

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100]

export function ClientesClient({
    clientes,
    currentPage,
    totalPages,
    totalCount,
    initialSearch,
    itemsPerPage
}: ClientesClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // --- Estado Local para controle do input ---
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const [selectedCliente, setSelectedCliente] = useState<ClienteData | null>(null)
    const [editingCliente, setEditingCliente] = useState<ClienteData | null>(null)

    // --- Manipuladores ---
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        params.set('page', '1') // Resetar para primeira página na busca
        router.replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleItemsPerPageChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('limit', value)
        params.set('page', '1') // Resetar para primeira página ao mudar o limite
        router.push(`${pathname}?${params.toString()}`)
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
                        defaultValue={initialSearch}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            handleSearch(e.target.value)
                        }}
                        className="pl-10 bg-white"
                    />
                </div>
            </div>

            {/* Tabela */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[10%]">Código</TableHead>
                            <TableHead className="w-[25%]">Nome</TableHead>
                            <TableHead className="w-[20%]">CPF</TableHead>
                            <TableHead className="w-[20%]">Telefone</TableHead>
                            <TableHead className="w-[25%]">Email</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientes.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum cliente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clientes.map((cliente) => (
                                <TableRow
                                    key={cliente.id}
                                    onClick={() => setSelectedCliente(cliente)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        {cliente.codigo}
                                    </TableCell>
                                    <TableCell>{cliente.nome}</TableCell>
                                    <TableCell>{formatCPF(cliente.cpf)}</TableCell>
                                    <TableCell>{formatTelefone(cliente.telefone)}</TableCell>
                                    <TableCell>{cliente.email}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <DetalhesClienteDialog clienteId={cliente.id}>
                                                <Button variant="ghost" size="icon" title="Visualizar">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DetalhesClienteDialog>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Editar"
                                                onClick={() => setEditingCliente(cliente)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

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
                            handleItemsPerPageChange(value)
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={itemsPerPage.toString()} />
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
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) handlePageChange(currentPage - 1)
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <span className="text-sm text-muted-foreground px-4">
                                    Página {currentPage} de {totalPages}
                                </span>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Resumo */}
            <div className="text-sm text-muted-foreground">
                Mostrando {clientes.length} de {totalCount} registros
            </div>


            {/* Modal de Detalhes (Global) - Abre ao clicar na linha */}
            {selectedCliente && (
                <DetalhesClienteDialog
                    clienteId={selectedCliente.id}
                    open={!!selectedCliente}
                    onOpenChange={(open) => !open && setSelectedCliente(null)}
                />
            )}

            {/* Modal de Edição (Global) - Abre ao clicar no ícone de editar */}
            {editingCliente && (
                <EditarClienteDialog
                    cliente={{
                        id: editingCliente.id,
                        nome: editingCliente.nome,
                        cpf: editingCliente.cpf !== '-' ? editingCliente.cpf : null,
                        telefone: editingCliente.telefone,
                        email: editingCliente.email,
                        observacoes: editingCliente.observacoes,
                        dataNascimento: editingCliente.dataNascimento
                    }}
                    open={!!editingCliente}
                    onOpenChange={(open) => !open && setEditingCliente(null)}
                />
            )}
        </div>
    )
}
