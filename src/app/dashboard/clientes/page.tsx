import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { format } from "date-fns"
import { ClientesClient } from "./clientes-client"
import { SelectCompanyState } from "@/components/dashboard/select-company-state"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ClientesPage({
    searchParams
}: {
    searchParams: SearchParams
}) {
    const session = await getServerSession(authOptions)


    // ...

    if (!session?.user?.empresaId) {
        if (session?.user?.cargo === "SUPER_ADMIN") {
            return <SelectCompanyState />
        }
        redirect("/login")
    }

    const params = await searchParams
    const search = typeof params.q === 'string' ? params.q : ''
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1
    const limit = typeof params.limit === 'string' ? parseInt(params.limit) : 25
    const skip = (page - 1) * limit

    const where: Prisma.ClienteWhereInput = {
        empresaId: session.user.empresaId,
        OR: search ? [
            { nome: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search } },
            { telefone: { contains: search } },
            // Adicionar busca por código se for número
            ...(!isNaN(Number(search)) ? [{ codigo: Number(search) }] : [])
        ] : undefined
    }

    // Buscar total para paginação
    const totalClientes = await db.cliente.count({ where })
    const totalPages = Math.ceil(totalClientes / limit)

    const clientes = await db.cliente.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip,
        take: limit,
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
    })

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
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalClientes}
            initialSearch={search}
            itemsPerPage={limit}
        />
    )
}
