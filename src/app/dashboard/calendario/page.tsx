import { db } from "@/lib/db"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        redirect('/login')
    }
    const empresaId = session.user.empresaId

    const [agendamentos, clientes, servicos, colaboradores] = await Promise.all([
        db.agendamento.findMany({
            where: { empresaId },
            include: {
                cliente: true,
                servico: true,
                colaborador: true,
            }
        }),
        db.cliente.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' }
        }),
        db.servico.findMany({
            where: { ativo: true, empresaId },
            orderBy: { nome: 'asc' }
        }),
        db.colaborador.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' }
        })
    ])

    const formattedServicos = servicos.map(s => ({
        ...s,
        preco: Number(s.preco)
    }))

    // Transformar Decimal em Number se necessário, mas para View priorizamos corresponder à interface
    // A interface espera servico { nome, duracaoMin }. Campos extras são ignorados ou aceitáveis.
    // Nós apenas passamos diretamente se os tipos alinharem, ou mapeamos se necessário.
    // Prisma Decimal não é compatível com number geralmente, mas não usamos preço na view ainda.
    // No entanto, para ser seguro e limpo:
    const formattedAgendamentos = agendamentos.map(apt => ({
        ...apt,
        status: apt.status.toString(), // Garantir que enum seja string
        servico: {
            ...apt.servico,
            preco: Number(apt.servico.preco)
        }
    }))

    return (
        <div className="p-8 h-full">
            <CalendarView
                agendamentos={formattedAgendamentos}
                clientes={clientes}
                servicos={formattedServicos}
                colaboradores={colaboradores}
            />
        </div>
    )
}
