import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, Trophy, Scissors } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { format, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
// Reuse filters from siblings
import { MonthFilter } from "../aniversariantes/month-filter"
import { YearFilter } from "../colaboradores/year-filter"

export default async function RelatorioServicosPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string, year?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) redirect("/login")

    const params = await searchParams

    // Default to current month/year
    const now = new Date()
    const currentMonth = params.month ? parseInt(params.month) : now.getMonth()
    const currentYear = params.year ? parseInt(params.year) : now.getFullYear()

    // Start of month
    const startDate = new Date(currentYear, currentMonth, 1)
    // End of month
    const endDate = endOfMonth(startDate)

    const formattedMonth = format(startDate, "MMMM", { locale: ptBR })
    const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

    const servicos = await db.servico.findMany({
        where: {
            empresaId: session.user.empresaId,
            ativo: true // Only active services? Or all? Usually reports include all to show history.
            // Let's include all for now, or just remove this filter if we want historical data of deleted/inactive services.
            // Actually, if a service is deleted (soft delete not implemented?), we might miss it.
            // Assuming we want currently defined services.
        },
        include: {
            _count: {
                select: {
                    agendamentos: {
                        where: {
                            data: {
                                gte: startDate,
                                lte: endDate
                            },
                            status: {
                                not: 'CANCELADO'
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            nome: 'asc'
        }
    })

    const sortedServicos = servicos
        .map(s => {
            const count = s._count.agendamentos
            const price = Number(s.preco)
            return {
                ...s,
                count,
                totalRevenue: count * price
            }
        })
        .sort((a, b) => b.count - a.count)

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/relatorios">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">Relatório de Serviços</h1>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border bg-white p-8 text-center min-h-[400px]">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900">Top Serviços - {capitalizedMonth} de {currentYear}</h2>
                    <div className="flex items-center justify-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Mês:</span>
                            <MonthFilter currentMonth={currentMonth} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Ano:</span>
                            <YearFilter currentYear={currentYear} />
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-4xl space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2 px-4">
                        <div className="col-span-1 text-center">Posição</div>
                        <div className="col-span-5 text-left">Serviço</div>
                        <div className="col-span-2 text-right">Realizados</div>
                        <div className="col-span-2 text-right">Preço Unit.</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>
                    {sortedServicos.map((servico, index) => (
                        <div key={servico.id} className="grid grid-cols-12 gap-4 text-sm py-3 border-b last:border-0 hover:bg-gray-50 items-center px-4">
                            <div className="col-span-1 text-center font-bold text-gray-500">
                                {index + 1}º
                            </div>
                            <div className="col-span-5 text-left flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Scissors className="h-4 w-4" />
                                </div>
                                <div className="font-medium text-gray-900">
                                    {servico.nome}
                                </div>
                                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                {index === 1 && <Trophy className="h-4 w-4 text-gray-400 fill-gray-400" />}
                                {index === 2 && <Trophy className="h-4 w-4 text-amber-700 fill-amber-700" />}
                            </div>
                            <div className="col-span-2 text-right text-lg font-semibold text-blue-600">
                                {servico.count}
                            </div>
                            <div className="col-span-2 text-right text-gray-600">
                                {Number(servico.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <div className="col-span-2 text-right font-medium text-green-600">
                                {servico.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </div>
                    ))}
                    {sortedServicos.length === 0 && (
                        <div className="py-8 text-muted-foreground text-sm">
                            Nenhum serviço realizado neste mês.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
