import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UpcomingAppointment {
    id: string
    data: Date
    cliente: {
        nome: string
    }
    servico: {
        nome: string
    }
}

interface UpcomingAppointmentsProps {
    appointments: UpcomingAppointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Próximos Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {appointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum agendamento futuro encontrado.
                        </p>
                    ) : (
                        appointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {appointment.cliente.nome[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{appointment.cliente.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {appointment.servico.nome}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-sm">
                                    {format(appointment.data, "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
