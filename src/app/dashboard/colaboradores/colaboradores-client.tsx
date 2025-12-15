"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Search, Plus, Pencil, Trash2, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

import { NovoColaboradorDialog } from "@/components/forms/colaboradores/novo-colaborador-dialog"
import { EditarColaboradorDialog } from "@/components/forms/colaboradores/editar-colaborador-dialog"
import { BotaoExcluirColaborador } from "@/components/forms/colaboradores/botao-excluir-colaborador"


interface Servico {
    id: string
    nome: string
    preco: number
    duracaoMin: number
    ativo: boolean
    criadoEm: Date
    atualizadoEm: Date
}

interface ColaboradorData {
    id: string
    codigo: string
    nome: string
    email: string | null
    foto: string | null
    servicosPrestados: string[]
    servicosRaw: Servico[]
}

interface ColaboradoresClientProps {
    colaboradores: ColaboradorData[]
    servicos: Servico[]
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function ColaboradoresClient({ colaboradores, servicos }: ColaboradoresClientProps) {
    const router = useRouter()

    // --- Local State ---
    const [searchTerm, setSearchTerm] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    // --- Filtering ---
    const filteredColaboradores = useMemo(() => {
        const term = searchTerm.toLowerCase()
        if (!term) return colaboradores

        return colaboradores.filter(colaborador =>
            colaborador.nome.toLowerCase().includes(term) ||
            colaborador.email?.toLowerCase().includes(term)
        )
    }, [colaboradores, searchTerm])

    // --- Pagination ---
    const totalItems = filteredColaboradores.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const currentColaboradores = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredColaboradores.slice(start, start + itemsPerPage)
    }, [filteredColaboradores, currentPage, itemsPerPage])

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, itemsPerPage])


    // --- Handlers ---
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
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-playfair text-2xl font-semibold text-foreground md:text-3xl">
                        Colaboradores
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gerencie sua equipe
                    </p>
                </div>
                <NovoColaboradorDialog servicos={servicos}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Colaborador
                    </Button>
                </NovoColaboradorDialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
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
                            <TableHead className="w-[80px]">Foto</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Serviços</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentColaboradores.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum colaborador encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentColaboradores.map((colaborador) => (
                                <TableRow key={colaborador.id}>
                                    <TableCell>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={colaborador.foto || undefined} />
                                            <AvatarFallback>
                                                {colaborador.nome.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {colaborador.nome}
                                    </TableCell>
                                    <TableCell>{colaborador.email || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {colaborador.servicosPrestados.length > 0 ? (
                                                colaborador.servicosPrestados.map((servico, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {servico}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <EditarColaboradorDialog
                                                colaborador={{
                                                    ...colaborador,
                                                    email: colaborador.email || "",
                                                    servicos: colaborador.servicosRaw
                                                }}
                                                servicos={servicos}
                                            >
                                                <Button variant="ghost" size="icon" title="Editar">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </EditarColaboradorDialog>

                                            <BotaoExcluirColaborador id={colaborador.id}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Excluir"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </BotaoExcluirColaborador>
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

            {/* Summary */}
            <div className="text-sm text-muted-foreground">
                Exibindo {currentColaboradores.length} de {totalItems} colaboradores  (Total Filtrado)
            </div>
        </div>
    )
}
