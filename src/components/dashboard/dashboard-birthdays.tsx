import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Cake, ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface DashboardBirthdaysProps {
    date: Date
    empresaId: string
}

export async function DashboardBirthdays({ date, empresaId }: DashboardBirthdaysProps) {
    const today = new Date(date)
    today.setHours(0, 0, 0, 0)
    
    // Calcula o início e o fim da semana atual
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sábado

    // Fetch clients
    const clientes = await db.cliente.findMany({
        where: { empresaId },
        select: {
            id: true,
            nome: true,
            telefone: true,
            dataNascimento: true
        }
    })

    // Filter those whose birthday is this week (ignoring the year)
    const aniversariantes = clientes.filter(cliente => {
        if (!cliente.dataNascimento) return false
        
        const bday = new Date(cliente.dataNascimento)
        const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
        
        return bdayThisYear >= startOfWeek && bdayThisYear <= endOfWeek
    }).map(cliente => {
        const bday = new Date(cliente.dataNascimento!)
        const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
        
        const dayOfWeek = bdayThisYear.toLocaleDateString('pt-BR', { weekday: 'short' })
        const isToday = bdayThisYear.getTime() === today.getTime()

        return {
            ...cliente,
            dayOfWeek: isToday ? 'Hoje' : dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
            isToday
        }
    }).sort((a, b) => {
        const dateA = new Date(a.dataNascimento!)
        const dateB = new Date(b.dataNascimento!)
        return dateA.getDate() - dateB.getDate()
    })

    return (
        <Card className="rounded-[10px] border-[#2A2418] bg-[#111111] py-0 shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 p-5 border-b border-[#2A2418]">
                <Gift className="h-4 w-4 text-[#71685F]" />
                <h2 className="font-heading text-[15px] font-semibold text-[#F5F0E8]">Aniversariantes da semana</h2>
            </div>
            
            <CardContent className="p-0">
                <div className="px-5 py-4 space-y-4">
                    {aniversariantes.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-center text-[#A9A198]">
                            <p className="text-sm font-medium">Nenhum aniversariante nesta semana.</p>
                        </div>
                    ) : (
                        aniversariantes.map((cliente) => (
                            <div key={cliente.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-[#2A2418]">
                                        <AvatarFallback className="bg-[#1B1B1B] text-[#F5F0E8] font-bold text-[11px]">
                                            {cliente.nome.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#F5F0E8]">{cliente.nome}</p>
                                        <p className="text-[11px] font-medium text-[#A9A198] mt-0.5">
                                            {cliente.dayOfWeek} · {cliente.telefone || 'Sem telefone'}
                                        </p>
                                    </div>
                                </div>
                                {cliente.isToday && (
                                    <div className="h-6 w-6 rounded-md bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <Cake className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-[#2A2418]">
                    <Button variant="outline" className="w-full h-10 border-[#2A2418] bg-[#1B1B1B] text-[#A9A198] hover:bg-[#D4AF37] hover:text-[#0D0D0D] hover:border-[#D4AF37] rounded-[8px] text-[13px] font-semibold transition-all group">
                        Enviar parabéns via WhatsApp
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
