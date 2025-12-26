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
    const [dataInicial, setDataInicial] = useState("")
    const [dataFinal, setDataFinal] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [colaboradorId, setColaboradorId] = useState("")

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

    // Agrupar por colaborador e calcular comissões
    const comissoesPorColaborador = useMemo(() => {
        const grupos: Record<string, {
            colaborador: Colaborador
            agendamentos: Agendamento[]
            totalServicos: number
            totalComissao: number
        }> = {}

        // Inicializar com todos os colaboradores
        colaboradores.forEach(col => {
            grupos[col.id] = {
                colaborador: col,
                agendamentos: [],
                totalServicos: 0,
                totalComissao: 0
            }
        })

        // Agrupar agendamentos
        agendamentosFiltrados.forEach(ag => {
            if (ag.colaboradorId && grupos[ag.colaboradorId]) {
                grupos[ag.colaboradorId].agendamentos.push(ag)
                grupos[ag.colaboradorId].totalServicos += ag.valor

                // Calcular comissão
                const col = grupos[ag.colaboradorId].colaborador
                if (col.comissaoValor) {
                    if (col.comissaoTipo === "PORCENTAGEM") {
                        grupos[ag.colaboradorId].totalComissao += (ag.valor * col.comissaoValor) / 100
                    } else {
                        grupos[ag.colaboradorId].totalComissao += col.comissaoValor
                    }
                }
            }
        })

        return Object.values(grupos).filter(g => g.agendamentos.length > 0)
    }, [agendamentosFiltrados, colaboradores])

    const totalGeralComissoes = comissoesPorColaborador.reduce((sum, g) => sum + g.totalComissao, 0)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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
                            {formatCurrency(totalGeralComissoes)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Lista por Colaborador */}
            {comissoesPorColaborador.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Nenhum agendamento concluído encontrado para os filtros selecionados.
                    </CardContent>
                </Card>
            ) : (
                comissoesPorColaborador.map(grupo => (
                    <Card key={grupo.colaborador.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-lg">{grupo.colaborador.nome}</CardTitle>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        {grupo.colaborador.comissaoTipo === "PORCENTAGEM" ? (
                                            <>
                                                <Percent className="h-3 w-3" />
                                                {grupo.colaborador.comissaoValor}%
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="h-3 w-3" />
                                                {formatCurrency(grupo.colaborador.comissaoValor || 0)}
                                            </>
                                        )}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Comissão</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(grupo.totalComissao)}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Serviço</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead className="text-right">Comissão</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grupo.agendamentos.map(ag => {
                                        const comissao = grupo.colaborador.comissaoTipo === "PORCENTAGEM"
                                            ? (ag.valor * (grupo.colaborador.comissaoValor || 0)) / 100
                                            : (grupo.colaborador.comissaoValor || 0)

                                        return (
                                            <TableRow key={ag.id}>
                                                <TableCell>
                                                    {new Date(ag.data).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell>{ag.clienteNome}</TableCell>
                                                <TableCell>{ag.servicoNome}</TableCell>
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
                            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {grupo.agendamentos.length} agendamento(s) concluído(s)
                                </span>
                                <span className="font-medium">
                                    Total Serviços: {formatCurrency(grupo.totalServicos)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}
