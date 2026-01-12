import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
// Use the new DaysFilter
import { DaysFilter } from "./days-filter"

export default async function ClientesSumidosPage({
    searchParams,
}: {
    searchParams: Promise<{ days?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) redirect("/login")

    const params = await searchParams
    const daysParam = params.days ? parseInt(params.days) : 30

    // Calculate target date based on days selected
    const targetDate = subDays(new Date(), daysParam)

    const formattedDate = format(targetDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

    // Find clients who have NO appointments since targetDate
    const clientesSumidos = await db.cliente.findMany({
        where: {
            empresaId: session.user.empresaId,
            AND: [
                {
                    agendamentos: {
                        none: {
                            data: {
                                gte: targetDate
                            }
                        }
                    }
                },
                // Optional: Ensure they actually have at least one past appointment?
                // If they never came, are they "sumidos"? Maybe.
                // Let's include everyone who hasn't come since date.
            ]
        },
        include: {
            agendamentos: {
                orderBy: { data: 'desc' },
                take: 1
            }
        },
        orderBy: { nome: 'asc' }
    })

    const hasData = clientesSumidos.length > 0

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/relatorios">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">Clientes Sumidos</h1>
            </div>

            <div className="flex flex-col space-y-6 rounded-xl border bg-white p-12 min-h-[400px]">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Clientes Sumidos</h2>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Período:</span>
                        <DaysFilter currentDays={daysParam} />
                    </div>
                </div>

                {!hasData ? (
                    <p className="text-sm text-muted-foreground">
                        Não existem clientes sumidos neste período ({daysParam} dias).
                    </p>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                            <div className="text-left">Cliente</div>
                            <div className="text-right">Última Visita</div>
                        </div>
                        {clientesSumidos.map((cliente) => (
                            <div key={cliente.id} className="grid grid-cols-2 gap-4 text-sm py-2 border-b last:border-0 hover:bg-gray-50">
                                <div className="text-left font-medium text-gray-900">
                                    {cliente.nome}
                                    <div className="text-xs text-gray-500 font-normal">{cliente.telefone}</div>
                                </div>
                                <div className="text-right text-gray-600">
                                    {cliente.agendamentos[0]
                                        ? format(cliente.agendamentos[0].data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                        : "Nunca visitou"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
