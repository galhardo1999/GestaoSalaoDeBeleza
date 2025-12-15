import { EmpresaForm } from "@/components/forms/empresa-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NovaEmpresaPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/admin/empresas">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Cadastro de Empresa</h2>
            </div>

            <EmpresaForm />
        </div>
    )
}
