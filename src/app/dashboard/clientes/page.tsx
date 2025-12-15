import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { format } from "date-fns"
import { ClientesClient } from "./clientes-client"

export default async function ClientesPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.empresaId) {
        redirect("/login")
    }

    const where: Prisma.ClienteWhereInput = {
        empresaId: session.user.empresaId,
    }

    const clientes = await db.cliente.findMany({
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
        />
    )
}
