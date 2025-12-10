import { db } from "@/lib/db"
import { NovoAgendamentoDialog } from "@/components/forms/agendamentos/novo-agendamento-dialog"
import { BotaoCancelarAgendamento } from "@/components/forms/agendamentos/botao-cancelar-agendamento"
import { ReagendarDialog } from "@/components/forms/agendamentos/reagendar-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

export default async function AgendamentosPage() {
    const agendamentos = await db.agendamento.findMany({
        include: {
            cliente: true,
            servico: true,
        },
        orderBy: {
            data: 'desc',
        },
    })

    // We need to fetch data for the dialog again
    const clientes = await db.cliente.findMany({
        orderBy: { nome: 'asc' }
    })

    const servicos = await db.servico.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
    })

    const formattedServicos = servicos.map(s => ({
        ...s,
        preco: Number(s.preco)
    }))

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
                    <p className="text-muted-foreground">Gerencie a agenda do salão.</p>
                </div>
                <NovoAgendamentoDialog clientes={clientes} servicos={formattedServicos} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agendamentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum agendamento encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            agendamentos.map((agendamento) => (
                                <TableRow key={agendamento.id}>
                                    <TableCell>
                                        {format(agendamento.data, "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>{agendamento.cliente.nome}</TableCell>
                                    <TableCell>{agendamento.servico.nome}</TableCell>
                                    <TableCell>R$ {Number(agendamento.servico.preco).toFixed(2)}</TableCell>
                                    <TableCell>{agendamento.status}</TableCell>
                                    <TableCell>
                                        {agendamento.status === 'AGENDADO' && (
                                            <div className="flex items-center gap-2">
                                                <ReagendarDialog id={agendamento.id} currentDate={agendamento.data} />
                                                <BotaoCancelarAgendamento id={agendamento.id} />
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
