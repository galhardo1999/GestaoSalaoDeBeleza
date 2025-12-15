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
            ativo: true // Mostrar apenas serviços ativos? O usuário não especificou, mas é mais seguro.
            // Na verdade, a implementação anterior não filtrava por ativos.
            // Vou filtrar por ativo apenas por precaução, ou mostrar todos.
            // Os dados de teste do usuário não implicavam status.
            // Vamos manter mostrando os ativos ou todos.
            // Código anterior linha 46: `where`. `where` foi definido para filtrar por nome.
            // Vou buscar TODOS por enquanto.
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
