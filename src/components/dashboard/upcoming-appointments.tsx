import { format } from "date-fns"
import Link from "next/link"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
    duracaoMin?: number
}

interface UpcomingAppointmentsProps {
    appointments: UpcomingAppointment[]
    date?: Date
}

export function UpcomingAppointments({ appointments, date }: UpcomingAppointmentsProps) {
    const displayDate = date || new Date()

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'CONCLUIDO':
                return "text-[#4ADE80] border-[#4ADE80]/20 bg-[#4ADE80]/10"
            case 'CONFIRMADO':
            case 'AGENDADO':
                return "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/10"
            case 'PENDENTE':
                return "text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/10"
            case 'CANCELADO':
            case 'NAO_COMPARECEU':
                return "text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/10"
            default:
                return "text-dashboard-muted border-dashboard-muted/20 bg-dashboard-muted/10"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'AGENDADO': return 'Agendado'
            case 'CONCLUIDO': return 'Concluído'
            case 'PENDENTE': return 'Pendente'
            case 'CANCELADO': return 'Cancelado'
            case 'NAO_COMPARECEU': return 'Não compareceu'
            default: return status.charAt(0) + status.slice(1).toLowerCase()
        }
    }

    return (
        <Card className="rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-2 p-5 border-b border-dashboard-border">
                <Clock className="h-4 w-4 text-dashboard-subtle" />
                <h2 className="font-heading text-[15px] font-semibold text-dashboard-foreground">Próximos agendamentos</h2>
            </div>

            <CardContent className="p-0">
                <div className="px-5 py-2 space-y-1">
                    {appointments.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-8 text-center text-dashboard-muted">
                            <p className="text-sm font-medium">Nenhum agendamento para esta data.</p>
                        </div>
                    ) : (
                        appointments.map((appointment) => {
                            const hora = new Intl.DateTimeFormat('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'America/Sao_Paulo'
                            }).format(appointment.data)
                            
                            const duracao = appointment.duracaoMin || 30;

                            return (
                                <div key={appointment.id} className="group relative flex items-center gap-4 py-3 border-b border-dashboard-border last:border-0 hover:bg-dashboard-surface-hover -mx-5 px-5 transition-colors">
                                    <div className="min-w-[50px] text-left">
                                        <div className="text-[13px] font-bold text-dashboard-foreground font-heading">{hora}</div>
                                        <div className="text-[10px] font-semibold text-dashboard-subtle mt-0.5">{duracao} min</div>
                                    </div>

                                    {appointment.status === 'CANCELADO' && (
                                        <div className="absolute left-[64px] top-1/2 w-[calc(100%-80px)] h-px bg-[#EF4444]/30 -translate-y-1/2 z-10 pointer-events-none" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h3 className={`truncate text-sm font-semibold ${appointment.status === 'CANCELADO' ? 'text-dashboard-subtle' : 'text-dashboard-foreground'}`}>
                                            {appointment.cliente.nome}
                                        </h3>
                                        <p className="truncate text-[11px] text-dashboard-muted mt-0.5">
                                            {appointment.servico.nome} {appointment.colaborador?.nome ? `- ${appointment.colaborador.nome.split(' ')[0]}` : ''}
                                        </p>
                                    </div>

                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusVariant(appointment.status)}`}>
                                            {getStatusLabel(appointment.status)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-5 border-t border-dashboard-border">
                    <Button variant="outline" className="w-full h-10 border-dashboard-border bg-transparent text-dashboard-muted hover:bg-dashboard-surface-hover hover:text-dashboard-primary hover:border-dashboard-primary/50 rounded-[8px] text-[13px] font-semibold transition-colors" asChild>
                        <Link href={`/dashboard/agendamentos?date=${format(displayDate, 'yyyy-MM-dd')}`}>
                            Ver todos os agendamentos
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
