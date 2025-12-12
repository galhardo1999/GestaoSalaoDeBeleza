import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { User, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface UpcomingAppointment {
    id: string
    data: Date
    status: string
    cliente: {
        nome: string
    }
    servico: {
        nome: string
    }
    colaborador?: {
        nome: string
    } | null
}

interface UpcomingAppointmentsProps {
    appointments: UpcomingAppointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
    const today = new Date()

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'CONCLUIDO':
                return "bg-gray-100 text-gray-600 hover:bg-gray-100"
            case 'CONFIRMADO':
                return "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" // Stylistically matching "Confirmado" in image seems to be outlined or light gray? Image shows "Concluido" as gray pill, "Confirmado" as white pill with border? Let's look closer. 
            // Actually image shows:
            // Maria Silva (Concluído) -> Gray background pill.
            // Carla Santos (Confirmado) -> White background, gray border? Or very light gray.
            // Let's stick to a clean look.
            case 'AGENDADO':
                return "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            case 'PENDENTE':
                return "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            default:
                return "bg-gray-100 text-gray-500 hover:bg-gray-100"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'AGENDADO': return 'Confirmado'
            case 'CONCLUIDO': return 'Concluído'
            default: return status.charAt(0) + status.slice(1).toLowerCase()
        }
    }

    return (
        <Card className="col-span-3 bg-white shadow-sm border-border">
            <div className="p-6 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-medium text-gray-900">Agenda de Hoje</h2>
                    <p className="text-gray-500 capitalize mt-1" suppressHydrationWarning>
                        {new Intl.DateTimeFormat('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            timeZone: 'America/Sao_Paulo'
                        }).format(new Date())}
                    </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                    <Clock className="h-5 w-5" />
                </div>
            </div>

            <CardContent className="px-6 pb-6 space-y-4">
                {appointments.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground bg-gray-50 border-dashed border-2 shadow-none">
                        Nenhum agendamento para hoje.
                    </Card>
                ) : (
                    appointments.map((appointment) => (
                        <div key={appointment.id} className="group relative flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all hover:shadow-md">
                            {/* Time Column */}
                            <div className="text-lg font-bold text-gray-900 min-w-[60px] text-center">
                                {new Intl.DateTimeFormat('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'America/Sao_Paulo'
                                }).format(appointment.data)}
                            </div>

                            {/* Vertical Separator */}
                            <div className="h-10 w-[1px] bg-gray-100" />

                            {/* Content Column */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        {appointment.cliente.nome}
                                    </h3>
                                    <Badge variant="secondary" className={`text-xs font-normal px-2.5 py-0.5 rounded-full ${getStatusVariant(appointment.status)}`}>
                                        {getStatusLabel(appointment.status)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 pl-0.5">
                                    {appointment.servico.nome}
                                </p>
                            </div>

                            {/* Collaborator Column */}
                            <div className="flex items-center gap-3 pl-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 hidden sm:block">
                                    {appointment.colaborador?.nome ? appointment.colaborador.nome.split(' ')[0] : 'Sem colaborador'}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                <div className="pt-2">
                    <Button variant="outline" className="w-full h-12 text-gray-500 hover:text-gray-900 border-gray-200 rounded-xl text-base font-normal" asChild>
                        <Link href="/dashboard/agendamentos">
                            Ver todos os agendamentos
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
