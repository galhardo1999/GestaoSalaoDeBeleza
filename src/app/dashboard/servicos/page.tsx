import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ServicosClient, { ServicoClient } from "./servicos-client"
import { SelectCompanyState } from "@/components/dashboard/select-company-state"

export default async function ServicosPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        if (session?.user?.cargo === "SUPER_ADMIN") {
            return <SelectCompanyState />
        }
        redirect("/login")
    }

    const servicosData = await db.servico.findMany({
        where: {
            empresaId: session.user.empresaId,
            ativo: true
        },
        orderBy: { nome: 'asc' },
        include: {
            _count: {
                select: { agendamento_itens: true }
            }
        },
    })

    const initialServicos: ServicoClient[] = servicosData.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco),
        duracao: s.duracaoMin,
        agendamentos: s._count.agendamento_itens
    }))

    return (
        <div className="p-8">
            <ServicosClient initialServicos={initialServicos} />
        </div>
    )
}
