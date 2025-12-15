"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { EditarEmpresaDialog } from "@/components/forms/editar-empresa-dialog"
import { ExcluirEmpresaDialog } from "@/components/forms/excluir-empresa-dialog"

interface EmpresasTableProps {
    data: {
        id: string
        nome: string
        cnpj: string
        criadoEm: Date
        _count: {
            usuarios: number
        }
    }[]
}

export function EmpresasTable({ data }: EmpresasTableProps) {
    const router = useRouter()

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead className="text-center">Usuários</TableHead>
                        <TableHead className="text-center">Data Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                Nenhuma empresa cadastrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((empresa) => (
                            <TableRow
                                key={empresa.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/admin/empresas/${empresa.id}`)}
                            >
                                <TableCell className="font-medium">{empresa.nome}</TableCell>
                                <TableCell>{empresa.cnpj.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")}</TableCell>
                                <TableCell className="text-center">{empresa._count.usuarios}</TableCell>
                                <TableCell className="text-center">
                                    {format(empresa.criadoEm, "dd/MM/yyyy", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        <EditarEmpresaDialog empresa={empresa} />
                                        <ExcluirEmpresaDialog id={empresa.id} nome={empresa.nome} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
