import { db } from "@/lib/db"
import { NovoServicoDialog } from "@/components/forms/servicos/novo-servico-dialog"
import { BotaoExcluirServico } from "@/components/forms/servicos/botao-excluir-servico"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function ServicosPage() {
    const servicos = await db.servico.findMany({
        orderBy: { nome: 'asc' },
        include: {
            _count: {
                select: { agendamentos: true }
            }
        }
    })

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
                    <p className="text-muted-foreground">Gerencie o catálogo de serviços.</p>
                </div>
                <NovoServicoDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Duração</TableHead>
                            <TableHead>Agendamentos</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servicos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum serviço cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            servicos.map((servico) => (
                                <TableRow key={servico.id}>
                                    <TableCell className="font-medium">{servico.nome}</TableCell>
                                    <TableCell>R$ {Number(servico.preco).toFixed(2)}</TableCell>
                                    <TableCell>{servico.duracaoMin} min</TableCell>
                                    <TableCell>{servico._count.agendamentos}</TableCell>
                                    <TableCell>
                                        <BotaoExcluirServico id={servico.id} />
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
