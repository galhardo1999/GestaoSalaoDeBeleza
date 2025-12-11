import { db } from "@/lib/db"
import { NovoClienteDialog } from "@/components/forms/clientes/novo-cliente-dialog"
import { BotaoExcluirCliente } from "@/components/forms/clientes/botao-excluir-cliente"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DetalhesClienteDialog } from "@/components/clientes/detalhes-cliente-dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

import { SearchInput } from "@/components/ui/search-input"
import { PaginationControl } from "@/components/ui/pagination-control"
import { EditarClienteDialog } from "@/components/forms/clientes/editar-cliente-dialog"
import { Prisma } from "@prisma/client"

export default async function ClientesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams
    const currentPage = Math.max(1, Number(params.page) || 1)
    const query = params.q || ''
    const itemsPerPage = 10
    const skip = (currentPage - 1) * itemsPerPage

    const where: Prisma.ClienteWhereInput = query ? {
        OR: [
            { nome: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { cpf: { contains: query } },
        ]
    } : {}

    const [totalItems, clientes] = await Promise.all([
        db.cliente.count({ where }),
        db.cliente.findMany({
            where,
            orderBy: { nome: 'asc' },
            include: {
                _count: {
                    select: { agendamentos: true }
                }
            },
            skip,
            take: itemsPerPage,
        })
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">Gerencie sua base de clientes.</p>
                </div>
                <NovoClienteDialog />
            </div>

            <div className="flex items-center justify-between">
                <SearchInput placeholder="Buscar clientes..." />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Agendamentos</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum cliente cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clientes.map((cliente) => (
                                <TableRow key={cliente.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        #{cliente.codigo}
                                    </TableCell>
                                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                                    <TableCell>{cliente.cpf || '-'}</TableCell>
                                    <TableCell>{cliente.telefone}</TableCell>
                                    <TableCell>{cliente._count.agendamentos}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <DetalhesClienteDialog clienteId={cliente.id}>
                                                <Button variant="ghost" size="icon" title="Ver Detalhes">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DetalhesClienteDialog>
                                            <EditarClienteDialog cliente={cliente} />
                                            <BotaoExcluirCliente id={cliente.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/dashboard/clientes"
            />
        </div>
    )
}
