import { db } from "@/lib/db"
import { TeamList } from "./team-list"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface DashboardTeamProps {
    empresaId: string
}

export async function DashboardTeam({ empresaId }: DashboardTeamProps) {
    const colaboradores = await db.colaborador.findMany({
        where: { empresaId },
        include: {
            servicos: true,
            agendamentos: {
                where: {
                    data: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    },
                    status: {
                        notIn: ['CANCELADO', 'NAO_COMPARECEU']
                    }
                },
                include: {
                    servico: true,
                    cliente: true
                }
            }
        }
    })

    // Serialize data to convert Prisma Decimal and Date to plain JavaScript types
    const serializedColaboradores = colaboradores.map(c => ({
        id: c.id,
        codigo: c.codigo,
        nome: c.nome,
        email: c.email,
        cpf: c.cpf,
        senha: c.senha,
        foto: c.foto,
        comissaoTipo: c.comissaoTipo,
        comissaoValor: c.comissaoValor ? Number(c.comissaoValor) : null,
        criadoEm: c.criadoEm.toISOString(),
        atualizadoEm: c.atualizadoEm.toISOString(),
        empresaId: c.empresaId,
        servicos: c.servicos.map(s => ({
            id: s.id,
            nome: s.nome,
            preco: Number(s.preco),
            duracaoMin: s.duracaoMin,
            ativo: s.ativo,
            criadoEm: s.criadoEm.toISOString(),
            atualizadoEm: s.atualizadoEm.toISOString(),
            empresaId: s.empresaId
        })),
        agendamentos: c.agendamentos.map(a => ({
            id: a.id,
            data: a.data.toISOString(),
            status: a.status,
            valor: a.valor ? Number(a.valor) : null,
            observacoes: a.observacoes,
            criadoEm: a.criadoEm.toISOString(),
            atualizadoEm: a.atualizadoEm.toISOString(),
            servico: {
                id: a.servico.id,
                nome: a.servico.nome,
                preco: Number(a.servico.preco),
                duracaoMin: a.servico.duracaoMin,
                ativo: a.servico.ativo
            },
            cliente: a.cliente ? {
                id: a.cliente.id,
                nome: a.cliente.nome,
                email: a.cliente.email,
                telefone: a.cliente.telefone
            } : null
        }))
    }))

    return <TeamList colaboradores={serializedColaboradores} />
}

export function DashboardTeamSkeleton() {
    return (
        <Card className="bg-white h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border p-4 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
