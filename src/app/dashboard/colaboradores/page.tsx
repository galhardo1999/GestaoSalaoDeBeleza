import { db } from "@/lib/db"
import { NovoColaboradorDialog } from "@/components/forms/colaboradores/novo-colaborador-dialog"
import { EditarColaboradorDialog } from "@/components/forms/colaboradores/editar-colaborador-dialog"
import { BotaoExcluirColaborador } from "@/components/forms/colaboradores/botao-excluir-colaborador"
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
import { Prisma } from "@prisma/client"

export default async function ColaboradoresPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ''
    const itemsPerPage = 10
    const skip = (currentPage - 1) * itemsPerPage

    const where: Prisma.ColaboradorWhereInput = query ? {
        OR: [
            { nome: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ]
    } : {}

    const [totalItems, colaboradores] = await Promise.all([
        db.colaborador.count({ where }),
        db.colaborador.findMany({
            where,
            orderBy: { nome: 'asc' },
            skip,
            take: itemsPerPage,
        })
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Colaboradores</h2>
                    <p className="text-muted-foreground">Gerencie a equipe do salão.</p>
                </div>
                <NovoColaboradorDialog />
            </div>

            <div className="flex items-center justify-between">
                <SearchInput placeholder="Buscar colaboradores..." />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {colaboradores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum colaborador cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            colaboradores.map((colaborador) => (
                                <TableRow key={colaborador.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        #{colaborador.codigo}
                                    </TableCell>
                                    <TableCell className="font-medium">{colaborador.nome}</TableCell>
                                    <TableCell>{colaborador.email}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <EditarColaboradorDialog colaborador={colaborador} />
                                        <BotaoExcluirColaborador id={colaborador.id} />
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
                baseUrl="/dashboard/colaboradores"
            />
        </div>
    )
}
