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
import { Search, Plus, Eye, Pencil, Trash2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

import { NovoColaboradorDialog } from "@/components/forms/colaboradores/novo-colaborador-dialog"
import { EditarColaboradorDialog } from "@/components/forms/colaboradores/editar-colaborador-dialog"
import { BotaoExcluirColaborador } from "@/components/forms/colaboradores/botao-excluir-colaborador"

interface ColaboradorData {
    id: string
    codigo: string
    nome: string
    email: string
    foto?: string | null
    servicosPrestados: string[]
    servicosRaw?: any[] // Keep raw data for Edit dialog
}

interface ColaboradoresClientProps {
    colaboradores: ColaboradorData[]
    servicos: any[]
    pagination: {
        currentPage: number
        totalPages: number
        itemsPerPage: number
        totalItems: number
    }
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function ColaboradoresClient({
    colaboradores,
    servicos,
    pagination,
}: ColaboradoresClientProps) {
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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
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
                        placeholder="Buscar por nome, email ou código..."
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
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Serviços Prestados</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {colaboradores.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-8 w-8" />
                                        <p>Nenhum colaborador encontrado.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            colaboradores.map((colaborador) => (
                                <TableRow key={colaborador.id}>
                                    <TableCell className="font-medium">
                                        #{colaborador.codigo}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={colaborador.foto || undefined} alt={colaborador.nome} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                    {getInitials(colaborador.nome)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{colaborador.nome}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{colaborador.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {colaborador.servicosPrestados.map((servico, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-600"
                                                >
                                                    {servico}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Visualizar">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <EditarColaboradorDialog
                                                colaborador={{
                                                    ...colaborador,
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
                                    size="default"
                                />
                            </PaginationItem>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(page)}
                                        isActive={pagination.currentPage === page}
                                        className="cursor-pointer"
                                        size="icon"
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
                                    size="default"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Summary */}
            <div className="text-sm text-muted-foreground">
                Exibindo {colaboradores.length} de {pagination.totalItems} colaboradores
            </div>
        </div>
    )
}
