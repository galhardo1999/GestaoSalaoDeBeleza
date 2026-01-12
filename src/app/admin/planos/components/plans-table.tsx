"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Power } from "lucide-react"
import { togglePlanStatus } from "@/actions/admin/planos"
import { useRouter } from "next/navigation"

interface Plan {
    id: string
    nome: string
    meses: number
    valor: any // Decimal
    ativo: boolean
    descricao: string | null
}

export function PlansTable({ data }: { data: Plan[] }) {
    const router = useRouter()

    async function handleToggleStatus(id: string, currentStatus: boolean) {
        const result = await togglePlanStatus(id, !currentStatus)
        if (result.success) {
            alert("Status atualizado!")
            router.refresh()
        } else {
            alert("Erro ao atualizar status")
        }
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((plan) => (
                        <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.nome}</TableCell>
                            <TableCell>{plan.meses} meses</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(Number(plan.valor))}
                            </TableCell>
                            <TableCell>
                                <Badge variant={plan.ativo ? "default" : "secondary"}>
                                    {plan.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(plan.id, plan.ativo)}
                                    title={plan.ativo ? "Desativar" : "Ativar"}
                                >
                                    <Power className={`h-4 w-4 ${plan.ativo ? "text-green-500" : "text-gray-400"}`} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Nenhum plano cadastrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
