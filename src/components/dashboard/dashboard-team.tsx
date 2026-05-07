import { db } from "@/lib/db"
import { TeamList } from "./team-list"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface DashboardTeamProps {
    date: Date
    empresaId: string
}

export async function DashboardTeam({ date, empresaId }: DashboardTeamProps) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    const startOfDay = new Date(Date.UTC(year, month, day, 3, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month, day, 26, 59, 59))

    const colaboradores = await db.colaborador.findMany({
        where: { empresaId },
        include: {
            servicos: true,
            agendamentos: {
                where: {
                    data: {
                        gte: startOfDay,
                        lt: endOfDay
                    },
                    status: {
                        notIn: ['CANCELADO', 'NAO_COMPARECEU']
                    }
                },
                include: {
                    agendamento_itens: {
                        include: {
                            servicos: true
                        }
                    },
                    cliente: true
                }
            }
        }
    })

    // Serialize data to convert Prisma Decimal and Date to plain JavaScript types
    const serializedColaboradores = colaboradores.map(c => ({
        id: c.id,
        nome: c.nome,
        foto: c.foto,
        servicos: c.servicos.map(s => ({
            nome: s.nome,
        })),
        agendamentos: c.agendamentos.map(a => {
            const firstItem = a.agendamento_itens[0]
            const totalDuration = a.agendamento_itens.reduce((sum, item) => sum + (item.duracao || item.servicos.duracaoMin || 30), 0)
            return {
                data: a.data.toISOString(),
                valor: a.valor ? Number(a.valor) : null,
                servico: firstItem ? {
                    nome: firstItem.servicos.nome,
                    duracaoMin: totalDuration,
                } : null,
                cliente: a.cliente ? {
                    nome: a.cliente.nome,
                } : null
            }
        })
    }))

    return <TeamList colaboradores={serializedColaboradores} />
}

export function DashboardTeamSkeleton() {
    return (
        <Card className="h-[400px] rounded-[10px] border-[#2A2418] bg-[#111111] py-0 shadow-[0_18px_50px_rgba(0,0,0,0.30)] flex flex-col">
            <div className="flex items-center gap-2 p-5 border-b border-[#2A2418]">
                <div className="h-4 w-4 rounded bg-[#2A2418] animate-pulse" />
                <div className="h-4 w-32 rounded bg-[#2A2418] animate-pulse" />
            </div>
            <CardContent className="flex-1 space-y-4 px-5 pb-5 pt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-[#2A2418] pb-3 last:border-0">
                        <div className="flex items-center gap-4">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-[#2A2418]" />
                            <div>
                                <div className="mb-1 h-3 w-24 animate-pulse rounded bg-[#2A2418]" />
                                <div className="h-2 w-16 animate-pulse rounded bg-[#2A2418]" />
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 w-24">
                            <div className="h-1.5 w-full bg-[#2A2418] rounded-full animate-pulse" />
                            <div className="h-2 w-6 bg-[#2A2418] rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
