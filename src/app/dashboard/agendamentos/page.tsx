import { db } from "@/lib/db"
import { NovoAgendamentoDialog } from "@/components/forms/agendamentos/novo-agendamento-dialog"
import { BotaoCancelarAgendamento } from "@/components/forms/agendamentos/botao-cancelar-agendamento"
import { ReagendarDialog } from "@/components/forms/agendamentos/reagendar-dialog"
import { WhatsAppButton } from "@/components/dashboard/whatsapp-button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

import { Prisma } from "@prisma/client"
import { SearchInput } from "@/components/ui/search-input"
import { PaginationControl } from "@/components/ui/pagination-control"

export default async function AgendamentosPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const session = await getServerSession(authOptions)
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ''
    const itemsPerPage = 10
    const skip = (currentPage - 1) * itemsPerPage

    const where: Prisma.AgendamentoWhereInput = query ? {
        OR: [
            { cliente: { nome: { contains: query, mode: Prisma.QueryMode.insensitive } } },
            { servico: { nome: { contains: query, mode: Prisma.QueryMode.insensitive } } },
        ]
    } : {}

    const [totalItems, agendamentos, user] = await Promise.all([
        db.agendamento.count({ where }),
        db.agendamento.findMany({
            where,
            include: {
                cliente: true,
                servico: true,
                colaborador: true,
            },
            orderBy: {
                data: 'desc',
            },
            skip,
            take: itemsPerPage,
        }),
        session?.user?.id ? db.usuario.findUnique({
            where: { id: session.user.id },
            include: { empresa: true }
        }) : null
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // We need to fetch data for the dialog again
    const clientes = await db.cliente.findMany({
        orderBy: { nome: 'asc' }
    })

    const servicos = await db.servico.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
    })

    const colaboradores = await db.colaborador.findMany({
        orderBy: { nome: 'asc' }
    })

    const formattedServicos = servicos.map(s => ({
        ...s,
        preco: Number(s.preco)
    }))

    const whatsappTemplate = user?.empresa?.mensagemWhatsapp

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
                    <p className="text-muted-foreground">Gerencie a agenda do salão.</p>
                </div>
                <NovoAgendamentoDialog clientes={clientes} servicos={formattedServicos} colaboradores={colaboradores} />
            </div>

            <div className="flex items-center justify-between">
                <SearchInput placeholder="Buscar agendamentos..." />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Data</TableHead>
                            <TableHead className="text-center">Hora</TableHead>
                            <TableHead className="text-center">Cliente</TableHead>
                            <TableHead className="text-center">Serviço</TableHead>
                            <TableHead className="text-center">Colaborador</TableHead>
                            <TableHead className="text-center">Preço</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agendamentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Nenhum agendamento encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            agendamentos.map((agendamento) => (
                                <TableRow key={agendamento.id}>
                                    <TableCell className="text-center">
                                        {format(agendamento.data, "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {format(agendamento.data, "HH:mm")}
                                    </TableCell>
                                    <TableCell className="text-center">{agendamento.cliente.nome}</TableCell>
                                    <TableCell className="text-center">{agendamento.servico.nome}</TableCell>
                                    <TableCell className="text-center">{agendamento.colaborador?.nome || '-'}</TableCell>
                                    <TableCell className="text-center">R$ {Number(agendamento.servico.preco).toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{agendamento.status}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <WhatsAppButton
                                                phone={agendamento.cliente.telefone}
                                                clientName={agendamento.cliente.nome}
                                                date={agendamento.data}
                                                serviceName={agendamento.servico.nome}
                                                messageTemplate={whatsappTemplate}
                                            />
                                            {agendamento.status === 'AGENDADO' && (
                                                <>
                                                    <ReagendarDialog id={agendamento.id} currentDate={agendamento.data} />
                                                    <BotaoCancelarAgendamento id={agendamento.id} />
                                                </>
                                            )}
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
                baseUrl="/dashboard/agendamentos"
            />
        </div>
    )
}
