import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyUsersManager } from "@/components/admin/company-users-manager"
import { ContractManager } from "./components/contract-manager"
import { getActivePlanos } from "@/actions/admin/planos"

export default async function EmpresaDetalhesPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const empresa = await db.empresa.findUnique({
        where: { id },
        include: {
            usuarios: true,
            contratos: {
                where: { ativo: true },
                orderBy: { fim: 'desc' },
                take: 1,
                include: { plano: true }
            }
        }
    })

    if (!empresa) {
        notFound()
    }

    const activePlans = await getActivePlanos()
    const currentContract = empresa.contratos[0]

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/admin/empresas">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">{empresa.nome}</h2>
            </div>

            <Tabs defaultValue="info" className="w-full">
                <TabsList>
                    <TabsTrigger value="info">Informações da Empresa</TabsTrigger>
                    <TabsTrigger value="usuarios">Usuários ({empresa.usuarios.length})</TabsTrigger>
                    <TabsTrigger value="contrato">Contrato</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes</CardTitle>
                            <CardDescription>Informações cadastrais da empresa.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">CNPJ</h4>
                                    <p>{empresa.cnpj}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Telefone 1</h4>
                                    <p>{empresa.telefone1 || "-"}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Telefone 2</h4>
                                    <p>{empresa.telefone2 || "-"}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Endereço</h4>
                                    <p>{empresa.endereco || "-"}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Data de Cadastro</h4>
                                    <p>{format(empresa.criadoEm, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usuarios" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usuários</CardTitle>
                            <CardDescription>Gerencie os usuários vinculados a esta empresa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CompanyUsersManager
                                empresaId={empresa.id}
                                usuarios={empresa.usuarios}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contrato" className="mt-6">
                    <ContractManager
                        empresaId={empresa.id}
                        contratoAtual={currentContract ? {
                            ...currentContract,
                            valorAcordado: Number(currentContract.valorAcordado),
                            plano: {
                                nome: currentContract.plano.nome
                            }
                        } : undefined}
                        planos={activePlans.map(p => ({ ...p, valor: Number(p.valor) }))}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
