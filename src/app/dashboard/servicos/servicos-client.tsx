"use client"

import { useState } from "react"

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
import { Search, Scissors, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

import { NovoServicoDialog } from "@/components/forms/servicos/novo-servico-dialog"
import { EditarServicoDialog } from "@/components/forms/servicos/editar-servico-dialog"
import { DetalhesServicoDialog } from "@/components/servicos/detalhes-servico-dialog"
import { BotaoExcluirServico } from "@/components/forms/servicos/botao-excluir-servico"

export interface ServicoClient {
    id: string
    nome: string
    preco: number
    duracao: number
    agendamentos: number
}

interface ServicosClientProps {
    initialServicos: ServicoClient[]
}

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100]

export default function ServicosClient({ initialServicos }: ServicosClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(25)
    const [selectedServico, setSelectedServico] = useState<ServicoClient | null>(null)

    const filteredServicos = initialServicos.filter((servico) =>
        servico.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredServicos.length / itemsPerPage)
    const paginatedServicos = filteredServicos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price)
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`
        }
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        if (remainingMinutes === 0) {
            return `${hours}h`
        }
        return `${hours}h ${remainingMinutes}min`
    }

    return (
        // Assumindo que o DashboardLayout já está envolvendo o conteúdo da página em page.tsx ou layout.tsx
        // A implementação anterior não importava DashboardLayout em page.tsx, estava provavelmente no layout correto.
        // Vou remover o wrapper DashboardLayout aqui e deixar o pai lidar com isso, ou apenas usar uma div como wrapper
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-playfair text-2xl font-semibold text-foreground md:text-3xl">
                        Serviços
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gerencie os serviços oferecidos
                    </p>
                </div>
                <NovoServicoDialog />
            </div>

            {/* Filtros */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome do serviço..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
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
                            <TableHead>Nome</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Duração</TableHead>
                            <TableHead>Agendamentos</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedServicos.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Scissors className="h-8 w-8" />
                                        <p>Nenhum serviço encontrado.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedServicos.map((servico) => (
                                <TableRow
                                    key={servico.id}
                                    onClick={() => setSelectedServico(servico)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        {servico.nome}
                                    </TableCell>
                                    <TableCell>{formatPrice(servico.preco)}</TableCell>
                                    <TableCell>{formatDuration(servico.duracao)}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            {servico.agendamentos}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Editar Serviço"
                                                onClick={() => setSelectedServico(servico)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <BotaoExcluirServico id={servico.id} />
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
                            setCurrentPage(1)
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
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={cn(
                                        "cursor-pointer",
                                        currentPage === 1 && "pointer-events-none opacity-50"
                                    )}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
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
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Resumo */}
            <div className="text-sm text-muted-foreground">
                Exibindo {paginatedServicos.length} de {filteredServicos.length} serviços
            </div>

            {/* Modal de Detalhes (Global) */}
            {selectedServico && (
                <DetalhesServicoDialog
                    servico={{
                        id: selectedServico.id,
                        nome: selectedServico.nome,
                        preco: selectedServico.preco,
                        duracao: selectedServico.duracao,
                        agendamentos: selectedServico.agendamentos
                    }}
                    open={!!selectedServico}
                    onOpenChange={(open) => !open && setSelectedServico(null)}
                />
            )}
        </div>
    )
}
