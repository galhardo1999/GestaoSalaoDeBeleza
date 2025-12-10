import { db } from "@/lib/db"
import { NovoColaboradorDialog } from "@/components/forms/colaboradores/novo-colaborador-dialog"
import { EditarColaboradorDialog } from "@/components/forms/colaboradores/editar-colaborador-dialog"
import { BotaoExcluirColaborador } from "@/components/forms/colaboradores/botao-excluir-colaborador"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function ColaboradoresPage() {
    const colaboradores = await db.colaborador.findMany({
        orderBy: { nome: 'asc' },
    })

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Colaboradores</h2>
                    <p className="text-muted-foreground">Gerencie a equipe do salão.</p>
                </div>
                <NovoColaboradorDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {colaboradores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum colaborador cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            colaboradores.map((colaborador) => (
                                <TableRow key={colaborador.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        #{colaborador.codigo}
                                    </TableCell>
                                    <TableCell className="font-medium">{colaborador.nome}</TableCell>
                                    <TableCell>{colaborador.email}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <EditarColaboradorDialog colaborador={colaborador} />
                                        <BotaoExcluirColaborador id={colaborador.id} />
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
