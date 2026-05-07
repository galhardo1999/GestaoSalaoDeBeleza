import { Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"

type DashboardTopServicesProps = {
    date: Date
    empresaId: string
}

export async function DashboardTopServices({ date, empresaId }: DashboardTopServicesProps) {
    const ano = date.getFullYear()
    const mes = date.getMonth()

    const inicioDoMes = new Date(Date.UTC(ano, mes, 1, 0, 0, 0))
    const fimDoMes = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59))

    const itensAgrupados = await db.agendamento_itens.groupBy({
        by: ["servico_id"],
        where: {
            agendamentos: {
                empresaId,
                status: "CONCLUIDO",
                data: {
                    gte: inicioDoMes,
                    lt: fimDoMes,
                },
            },
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: "desc",
            },
        },
        take: 5,
    })

    const servicos = await db.servico.findMany({
        where: {
            id: {
                in: itensAgrupados.map((item) => item.servico_id),
            },
        },
        select: {
            id: true,
            nome: true,
        },
    })

    const servicosPorId = new Map(servicos.map((servico) => [servico.id, servico.nome]))
    const servicosRealizados = itensAgrupados.map((item) => ({
        nome: servicosPorId.get(item.servico_id) || "Desconhecido",
        count: item._count.id,
    }))
    const maiorQuantidade = servicosRealizados[0]?.count || 0

    const obterLargura = (count: number) => {
        if (maiorQuantidade === 0) return "w-1/4"

        const percentual = (count / maiorQuantidade) * 100
        if (percentual >= 85) return "w-full"
        if (percentual >= 65) return "w-4/5"
        if (percentual >= 45) return "w-3/5"
        if (percentual >= 25) return "w-2/5"
        return "w-1/4"
    }

    return (
        <Card className="rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 border-b border-dashboard-border p-5">
                <Scissors className="h-4 w-4 text-dashboard-subtle" />
                <h2 className="font-heading text-[15px] font-semibold text-dashboard-foreground">
                    Serviços mais realizados (mês)
                </h2>
            </div>

            <CardContent className="p-5">
                <div className="space-y-4">
                    {servicosRealizados.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-center text-dashboard-muted">
                            <p className="text-sm font-medium">Nenhum serviço concluído neste mês.</p>
                        </div>
                    ) : (
                        servicosRealizados.map((servico) => (
                            <div key={servico.nome} className="flex items-center gap-4">
                                <div className="min-w-[80px] truncate text-[13px] font-semibold text-dashboard-foreground" title={servico.nome}>
                                    {servico.nome}
                                </div>

                                <div className="flex h-6 flex-1 items-center overflow-hidden rounded-full border border-dashboard-border bg-dashboard-surface-hover">
                                    <div className={`flex h-full items-center bg-dashboard-primary px-3 ${obterLargura(servico.count)}`}>
                                        <span className="text-[10px] font-bold text-dashboard-primary-foreground">
                                            {servico.count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-auto pt-5">
                    <Button variant="outline" className="h-10 w-full rounded-[8px] border-dashboard-border bg-transparent text-[13px] font-semibold text-dashboard-muted transition-colors hover:border-dashboard-primary/50 hover:bg-dashboard-surface-hover hover:text-dashboard-primary">
                        Análise por serviço
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
