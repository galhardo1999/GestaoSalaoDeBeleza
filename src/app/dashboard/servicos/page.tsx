import { db } from "@/lib/db"
import { NovoServicoDialog } from "@/components/forms/servicos/novo-servico-dialog"
import { BotaoExcluirServico } from "@/components/forms/servicos/botao-excluir-servico"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { SearchInput } from "@/components/ui/search-input"
import { PaginationControl } from "@/components/ui/pagination-control"
import { EditarServicoDialog } from "@/components/forms/servicos/editar-servico-dialog"
import { Prisma } from "@prisma/client"

export default async function ServicosPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ''
    const itemsPerPage = 10
    const skip = (currentPage - 1) * itemsPerPage

    const where: Prisma.ServicoWhereInput = query ? {
        nome: { contains: query, mode: Prisma.QueryMode.insensitive },
    } : {}

    const [totalItems, servicos] = await Promise.all([
        db.servico.count({ where }),
        db.servico.findMany({
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
                    <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
                    <p className="text-muted-foreground">Gerencie o catálogo de serviços.</p>
                </div>
                <NovoServicoDialog />
            </div>

            <div className="flex items-center justify-between">
                <SearchInput placeholder="Buscar serviços..." />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Duração</TableHead>
                            <TableHead>Agendamentos</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servicos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum serviço cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            servicos.map((servico) => (
                                <TableRow key={servico.id}>
                                    <TableCell className="font-medium">{servico.nome}</TableCell>
                                    <TableCell>R$ {Number(servico.preco).toFixed(2)}</TableCell>
                                    <TableCell>{servico.duracaoMin} min</TableCell>
                                    <TableCell>{servico._count.agendamentos}</TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <EditarServicoDialog servico={{
                                                ...servico,
                                                preco: Number(servico.preco)
                                            }} />
                                            <BotaoExcluirServico id={servico.id} />
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
                baseUrl="/dashboard/servicos"
            />
        </div >
    )
}
