import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { format } from "date-fns"
import { ClientesClient } from "./clientes-client"

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
                },
                agendamentos: {
                    take: 1,
                    orderBy: { data: 'desc' },
                    select: { data: true }
                }
            },
            skip,
            take: itemsPerPage,
        })
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const formattedClientes = clientes.map(cliente => ({
        id: cliente.id,
        codigo: cliente.codigo.toString(),
        nome: cliente.nome,
        cpf: cliente.cpf || '-',
        telefone: cliente.telefone,
        agendamentos: cliente._count.agendamentos,
        ultimoAgendamento: cliente.agendamentos[0]
            ? format(cliente.agendamentos[0].data, "dd/MM/yyyy")
            : '-',
        email: cliente.email,
        observacoes: cliente.observacoes
    }))

    return (
        <ClientesClient
            clientes={formattedClientes}
            pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems
            }}
        />
    )
}
