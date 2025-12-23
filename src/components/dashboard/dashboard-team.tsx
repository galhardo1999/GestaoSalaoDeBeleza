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

    // Serialize data to convert Prisma Decimal to plain numbers
    const serializedColaboradores = colaboradores.map(c => ({
        ...c,
        servicos: c.servicos.map(s => ({
            ...s,
            preco: Number(s.preco)
        })),
        agendamentos: c.agendamentos.map(a => ({
            ...a,
            valor: a.valor ? Number(a.valor) : null,
            servico: {
                ...a.servico,
                preco: Number(a.servico.preco)
            }
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
