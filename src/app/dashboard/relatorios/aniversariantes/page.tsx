import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, Gift } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MonthFilter } from "./month-filter"

export default async function AniversariantesPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) redirect("/login")

    const params = await searchParams

    // Default to current month (0-11)
    const currentMonth = params.month ? parseInt(params.month) : new Date().getMonth()

    // Fetch all clients with a birthdate
    const allClients = await db.cliente.findMany({
        where: {
            empresaId: session.user.empresaId,
            dataNascimento: {
                not: null
            }
        },
        select: {
            id: true,
            nome: true,
            dataNascimento: true,
            telefone: true,
            email: true,
            agendamentos: {
                orderBy: { data: 'desc' },
                take: 1,
                select: { data: true }
            }
        }
    })

    // Filter and Sort in JS
    const aniversariantes = allClients
        .filter(client => {
            // Safe assertion because of where clause
            const birthDate = new Date(client.dataNascimento!)
            // getMonth() is 0-indexed, same as our currentMonth param
            // Using getUTCMonth to be consistent with how we stored it (usually)
            // Ideally we should check how it was saved. Assuming UTC/ISO.
            return birthDate.getUTCMonth() === currentMonth
        })
        .sort((a, b) => {
            const dayA = new Date(a.dataNascimento!).getUTCDate()
            const dayB = new Date(b.dataNascimento!).getUTCDate()
            return dayA - dayB
        })

    const monthName = format(new Date(2024, currentMonth, 1), 'MMMM', { locale: ptBR })
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/relatorios">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">Aniversariantes do Mês</h1>
            </div>

            <div className="flex flex-col space-y-6 rounded-xl border bg-white p-8 min-h-[400px]">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Aniversariantes de {capitalizedMonthName}</h2>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Mês:</span>
                        <MonthFilter currentMonth={currentMonth} />
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2 px-4">
                        <div className="col-span-2 text-left">Data Nascimento</div>
                        <div className="col-span-3 text-left">Cliente</div>
                        <div className="col-span-3 text-left">Email</div>
                        <div className="col-span-2 text-left">Contato</div>
                        <div className="col-span-2 text-right">Último Atendimento</div>
                    </div>
                    {aniversariantes.map((cliente) => {
                        const birthDate = new Date(cliente.dataNascimento!)
                        const day = birthDate.getUTCDate()
                        const month = birthDate.getUTCMonth() + 1
                        const year = birthDate.getUTCFullYear()
                        const formattedBirthDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`

                        const lastVisit = cliente.agendamentos[0]?.data

                        return (
                            <div key={cliente.id} className="grid grid-cols-12 gap-4 text-sm py-3 border-b last:border-0 hover:bg-gray-50 items-center px-4">
                                <div className="col-span-2 text-left font-semibold text-gray-700">
                                    {formattedBirthDate}
                                </div>
                                <div className="col-span-3 text-left flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{cliente.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium text-gray-900 line-clamp-1" title={cliente.nome}>
                                        {cliente.nome}
                                    </div>
                                    {/* <Gift className="h-3 w-3 text-pink-500 flex-shrink-0" /> */}
                                </div>
                                <div className="col-span-3 text-left text-gray-600 truncate" title={cliente.email || ""}>
                                    {cliente.email || "-"}
                                </div>
                                <div className="col-span-2 text-left text-gray-600 text-xs">
                                    {cliente.telefone}
                                </div>
                                <div className="col-span-2 text-right text-gray-600 text-xs">
                                    {lastVisit
                                        ? format(lastVisit, "dd/MM/yyyy", { locale: ptBR })
                                        : "Nunca"}
                                </div>
                            </div>
                        )
                    })}
                    {aniversariantes.length === 0 && (
                        <div className="py-8 text-muted-foreground text-sm">
                            Nenhum aniversariante encontrado neste mês.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
