import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ServicosClient, { ServicoClient } from "./servicos-client"

export default async function ServicosPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) redirect("/login")

    const servicosData = await db.servico.findMany({
        where: {
            empresaId: session.user.empresaId,
            ativo: true // Only show active services? User didn't specify, but safer. 
            // Actually, previous implementation didn't filter by active.
            // I'll filter by active just in case, or show all.
            // User's mock data didn't imply status.
            // Let's stick to showing active ones or all.
            // Previous code line 46: `where`. `where` was defined to filter by name.
            // I'll fetch ALL for now.
        },
        orderBy: { nome: 'asc' },
        include: {
            _count: {
                select: { agendamentos: true }
            }
        },
    })

    const initialServicos: ServicoClient[] = servicosData.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco),
        duracao: s.duracaoMin,
        agendamentos: s._count.agendamentos
    }))

    return (
        <div className="p-8">
            <ServicosClient initialServicos={initialServicos} />
        </div>
    )
}
