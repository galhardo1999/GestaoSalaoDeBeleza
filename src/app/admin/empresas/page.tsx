import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
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
import { EmpresasTable } from "./empresas-table"

export default async function AdminEmpresasPage() {
    const empresas = await db.empresa.findMany({
        orderBy: { criadoEm: 'desc' },
        include: {
            _count: {
                select: { usuarios: true }
            },
            contratos: {
                where: { ativo: true },
                take: 1,
                include: { plano: true }
            }
        }
    })

    const formattedEmpresas = empresas.map(empresa => ({
        ...empresa,
        contratos: empresa.contratos.map(contrato => ({
            ...contrato,
            valorAcordado: Number(contrato.valorAcordado),
            plano: {
                ...contrato.plano,
                valor: Number(contrato.plano.valor)
            }
        }))
    }))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Empresas</h2>
                    <p className="text-gray-500 mt-2">Gerencie as empresas cadastradas.</p>
                </div>
                <Link href="/admin/empresas/nova">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Empresa
                    </Button>
                </Link>
            </div>

            <EmpresasTable data={formattedEmpresas} />
        </div>
    )
}
