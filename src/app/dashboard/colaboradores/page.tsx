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

    const [totalItems, colaboradores, servicos] = await Promise.all([
        db.colaborador.count({ where }),
        db.colaborador.findMany({
            where,
            orderBy: { nome: 'asc' },
            skip,
            take: itemsPerPage,
            include: {
                servicos: true
            } as any
        }),
        db.servico.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' }
        })
    ])

    const formattedServicos = servicos.map(s => ({
        ...s,
        preco: s.preco.toNumber(),
    }))

    const formattedColaboradores = colaboradores.map((c: any) => ({
        ...c,
        servicos: c.servicos ? c.servicos.map((s: any) => ({
            ...s,
            preco: s.preco.toNumber()
        })) : []
    }))

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Colaboradores</h2>
                    <p className="text-muted-foreground">Gerencie a equipe do salão.</p>
                </div>
                <NovoColaboradorDialog servicos={formattedServicos} />
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
                            <TableHead>Serviços</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formattedColaboradores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum colaborador cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            formattedColaboradores.map((colaborador) => (
                                <TableRow key={colaborador.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        #{colaborador.codigo}
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        {colaborador.foto ? (
                                            <img src={colaborador.foto} alt={colaborador.nome} className="h-8 w-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                                                {colaborador.nome.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="font-medium">{colaborador.nome}</span>
                                    </TableCell>
                                    <TableCell>{colaborador.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {colaborador.servicos && colaborador.servicos.length > 0 ? (
                                                colaborador.servicos.map((s: any) => (
                                                    <span key={s.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {s.nome}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Nenhum serviço</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <EditarColaboradorDialog colaborador={colaborador} servicos={formattedServicos} />
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
