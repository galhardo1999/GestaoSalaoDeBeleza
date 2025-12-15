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
                        <TableHead>Usuários</TableHead>
                        <TableHead>Data Cadastro</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500">
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
                                <TableCell>{empresa.cnpj}</TableCell>
                                <TableCell>{empresa._count.usuarios}</TableCell>
                                <TableCell>
                                    {format(empresa.criadoEm, "dd/MM/yyyy", { locale: ptBR })}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
