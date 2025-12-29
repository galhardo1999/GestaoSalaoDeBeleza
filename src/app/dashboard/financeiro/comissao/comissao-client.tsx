"use client"

import { useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Calendar, DollarSign, Percent, Users } from "lucide-react"

interface Agendamento {
    id: string
    data: string
    valor: number
    clienteNome: string
    servicoNome: string
    colaboradorId: string
    colaboradorNome: string
    comissaoTipo: string
    comissaoValor: number | null
}

interface Colaborador {
    id: string
    nome: string
    comissaoTipo: string
    comissaoValor: number | null
}

interface ComissaoClientProps {
    agendamentos: Agendamento[]
    colaboradores: Colaborador[]
}

export function ComissaoClient({ agendamentos, colaboradores }: ComissaoClientProps) {
    // Inicializar datas com o mês atual
    const [dataInicial, setDataInicial] = useState(() => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        return firstDay.toISOString().split('T')[0]
    })
    const [dataFinal, setDataFinal] = useState(() => {
        const now = new Date()
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return lastDay.toISOString().split('T')[0]
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [colaboradorId, setColaboradorId] = useState("")

    // Paginação
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(25)

    // Filtrar agendamentos
    const agendamentosFiltrados = useMemo(() => {
        return agendamentos.filter(ag => {
            // Filtro de data
            const dataAg = new Date(ag.data)
            if (dataInicial && dataAg < new Date(dataInicial)) return false
            if (dataFinal && dataAg > new Date(dataFinal + "T23:59:59")) return false

            // Filtro por colaborador
            if (colaboradorId && ag.colaboradorId !== colaboradorId) return false

            // Filtro de busca
            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                const matchCliente = ag.clienteNome.toLowerCase().includes(term)
                const matchServico = ag.servicoNome.toLowerCase().includes(term)
                if (!matchCliente && !matchServico) return false
            }

            return true
        })
    }, [agendamentos, dataInicial, dataFinal, colaboradorId, searchTerm])

    const totalItems = agendamentosFiltrados.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const paginatedAgendamentos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return agendamentosFiltrados.slice(start, start + itemsPerPage)
    }, [agendamentosFiltrados, currentPage, itemsPerPage])

    // Resetar página quando filtros mudarem
    useMemo(() => {
        setCurrentPage(1)
    }, [agendamentosFiltrados.length])

    // Calcular totais
    const totalGeral = useMemo(() => {
        return agendamentosFiltrados.reduce((acc, ag) => {
            // Encontrar colaborador para pegar taxa
            const col = colaboradores.find(c => c.id === ag.colaboradorId)
            let comissao = 0
            if (col && col.comissaoValor) {
                if (col.comissaoTipo === "PORCENTAGEM") {
                    comissao = (ag.valor * col.comissaoValor) / 100
                } else {
                    comissao = col.comissaoValor
                }
            }

            return {
                servicos: acc.servicos + ag.valor,
                comissao: acc.comissao + comissao
            }
        }, { servicos: 0, comissao: 0 })
    }, [agendamentosFiltrados, colaboradores])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    // Helper para calcular comissão de uma linha
    const getComissao = (ag: Agendamento) => {
        const col = colaboradores.find(c => c.id === ag.colaboradorId)
        if (!col || !col.comissaoValor) return 0
        if (col.comissaoTipo === "PORCENTAGEM") {
            return (ag.valor * col.comissaoValor) / 100
        }
        return col.comissaoValor
    }

    return (
        <div className="p-8 space-y-6">
            {/* Cabeçalho */}
            <div>
                <h1 className="font-playfair text-2xl font-semibold text-foreground md:text-3xl">
                    Comissões
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Relatório de comissões por colaborador (agendamentos concluídos)
                </p>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="dataInicial" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Data Inicial
                            </Label>
                            <Input
                                id="dataInicial"
                                type="date"
                                value={dataInicial}
                                onChange={(e) => setDataInicial(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataFinal" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Data Final
                            </Label>
                            <Input
                                id="dataFinal"
                                type="date"
                                value={dataFinal}
                                onChange={(e) => setDataFinal(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="colaborador" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Colaborador
                            </Label>
                            <select
                                id="colaborador"
                                value={colaboradorId}
                                onChange={(e) => setColaboradorId(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Todos</option>
                                {colaboradores.map(col => (
                                    <option key={col.id} value={col.id}>{col.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="busca">Buscar por Cliente ou Serviço</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="busca"
                                    placeholder="Digite para buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resumo Total */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="font-medium">Total de Comissões</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {formatCurrency(totalGeral.comissao)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela Unificada */}
            <Card>
                <CardContent className="pt-6">
                    {agendamentosFiltrados.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            Nenhum agendamento concluído encontrado para os filtros selecionados.
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Serviço</TableHead>
                                        <TableHead>Colaborador</TableHead>
                                        <TableHead className="text-right">Comissão</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead className="text-right">Comissão</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAgendamentos.map(ag => {
                                        const comissao = getComissao(ag)
                                        const col = colaboradores.find(c => c.id === ag.colaboradorId)

                                        return (
                                            <TableRow key={ag.id}>
                                                <TableCell>
                                                    {new Date(ag.data).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell>{ag.clienteNome}</TableCell>
                                                <TableCell>{ag.servicoNome}</TableCell>
                                                <TableCell className="font-medium">
                                                    {ag.colaboradorNome}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {col?.comissaoTipo === "PORCENTAGEM" ? (
                                                        <Badge variant="outline">{col.comissaoValor}%</Badge>
                                                    ) : (
                                                        <Badge variant="outline">{formatCurrency(col?.comissaoValor || 0)}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(ag.valor)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {formatCurrency(comissao)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Itens por página:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="h-8 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span>
                                        Mostrando {paginatedAgendamentos.length} de {totalItems} resultados
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Próxima
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
