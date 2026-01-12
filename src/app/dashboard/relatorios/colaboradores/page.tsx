import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, endOfMonth, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
// Import MonthFilter from the sibling directory (or a shared location)
// Assuming we can import from ../aniversariantes/month-filter for now
import { MonthFilter } from "../aniversariantes/month-filter"
import { YearFilter } from "./year-filter"

export default async function RelatorioColaboradoresPage({
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

    const colaboradores = await db.colaborador.findMany({
        where: {
            empresaId: session.user.empresaId
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

    const sortedColaboradores = colaboradores
        .map(c => ({
            id: c.id,
            codigo: c.codigo,
            nome: c.nome,
            email: c.email,
            cpf: c.cpf,
            foto: c.foto,
            comissaoTipo: c.comissaoTipo,
            comissaoValor: c.comissaoValor ? Number(c.comissaoValor) : null,
            criadoEm: c.criadoEm.toISOString(),
            atualizadoEm: c.atualizadoEm.toISOString(),
            empresaId: c.empresaId,
            appointmentsCount: c._count.agendamentos
        }))
        .sort((a, b) => b.appointmentsCount - a.appointmentsCount)

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/relatorios">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">Relatório de Colaboradores</h1>
            </div>

            <div className="flex flex-col space-y-6 rounded-xl border bg-white p-8 min-h-[400px]">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Top Colaboradores - {capitalizedMonth} de {currentYear}</h2>
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

                <div className="w-full space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2 px-4">
                        <div className="col-span-1 text-center">Posição</div>
                        <div className="col-span-8 text-left">Colaborador</div>
                        <div className="col-span-3 text-right">Atendimentos</div>
                    </div>
                    {sortedColaboradores.map((colaborador, index) => (
                        <div key={colaborador.id} className="grid grid-cols-12 gap-4 text-sm py-3 border-b last:border-0 hover:bg-gray-50 items-center px-4">
                            <div className="col-span-1 text-center font-bold text-gray-500">
                                {index + 1}º
                            </div>
                            <div className="col-span-8 text-left flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={colaborador.foto || undefined} />
                                    <AvatarFallback>{colaborador.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium text-gray-900">
                                    {colaborador.nome}
                                </div>
                                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                {index === 1 && <Trophy className="h-4 w-4 text-gray-400 fill-gray-400" />}
                                {index === 2 && <Trophy className="h-4 w-4 text-amber-700 fill-amber-700" />}
                            </div>
                            <div className="col-span-3 text-right text-lg font-semibold text-blue-600">
                                {colaborador.appointmentsCount}
                            </div>
                        </div>
                    ))}
                    {sortedColaboradores.length === 0 && (
                        <div className="py-8 text-muted-foreground text-sm">
                            Nenhum atendimento realizado neste mês.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
