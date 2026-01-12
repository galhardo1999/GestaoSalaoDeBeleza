"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { assignContract } from "@/actions/admin/planos"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Plan {
    id: string
    nome: string
    meses: number
    valor: any
}

interface Contract {
    id: string
    inicio: Date
    fim: Date
    valorAcordado: any
    ativo: boolean
    plano: {
        nome: string
    }
}

export function ContractManager({
    empresaId,
    contratoAtual,
    planos
}: {
    empresaId: string
    contratoAtual?: Contract
    planos: Plan[]
}) {
    const [selectedPlanId, setSelectedPlanId] = useState<string>("")
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const selectedPlan = planos.find(p => p.id === selectedPlanId)

    // Calculate end date based on selection
    const calculatedEndDate = selectedPlan && startDate ? (() => {
        const d = new Date(startDate)
        d.setMonth(d.getMonth() + selectedPlan.meses)
        return d
    })() : null

    async function handleAssign() {
        if (!selectedPlanId || !startDate) return

        setIsLoading(true)
        const result = await assignContract({
            empresaId,
            planoId: selectedPlanId,
            inicio: new Date(startDate)
        })

        if (result.success) {
            alert("Contrato atribuído com sucesso!")
            router.refresh()
            setSelectedPlanId("")
        } else {
            alert(result.error || "Erro ao atribuir contrato")
        }
        setIsLoading(false)
    }

    const isExpired = contratoAtual && new Date(contratoAtual.fim) < new Date()

    return (
        <div className="space-y-6">
            {/* Current Contract Display */}
            {contratoAtual ? (
                <Card className={`border-${isExpired ? 'red' : 'green'}-200 bg-${isExpired ? 'red' : 'green'}-50`}>
                    <CardHeader>
                        <CardTitle className={`text-${isExpired ? 'red' : 'green'}-800`}>
                            {isExpired ? "Contrato Vencido" : "Contrato Ativo"}
                        </CardTitle>
                        <CardDescription className={`text-${isExpired ? 'red' : 'green'}-700`}>
                            {isExpired
                                ? "O contrato desta empresa expirou."
                                : "Esta empresa possui um contrato vigente."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <div className={`text-sm font-medium text-${isExpired ? 'red' : 'green'}-800`}>Plano</div>
                            <div className={`text-2xl font-bold text-${isExpired ? 'red' : 'green'}-900`}>{contratoAtual.plano.nome}</div>
                        </div>
                        <div>
                            <div className={`text-sm font-medium text-${isExpired ? 'red' : 'green'}-800`}>Vencimento</div>
                            <div className={`text-2xl font-bold text-${isExpired ? 'red' : 'green'}-900`}>
                                {format(new Date(contratoAtual.fim), "dd/MM/yyyy")}
                            </div>
                        </div>
                        <div>
                            <div className={`text-sm font-medium text-${isExpired ? 'red' : 'green'}-800`}>Início</div>
                            <div className={`text-${isExpired ? 'red' : 'green'}-900`}>
                                {format(new Date(contratoAtual.inicio), "dd/MM/yyyy")}
                            </div>
                        </div>
                        <div>
                            <div className={`text-sm font-medium text-${isExpired ? 'red' : 'green'}-800`}>Valor Acordado</div>
                            <div className={`text-${isExpired ? 'red' : 'green'}-900 font-medium`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(contratoAtual.valorAcordado))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-yellow-800">Sem Contrato Ativo</CardTitle>
                        <CardDescription className="text-yellow-700">
                            Esta empresa não possui um contrato ativo no momento.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* New Contract Form - Só aparece se não tiver contrato ou se estiver vencido */}
            {(!contratoAtual || isExpired) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{contratoAtual ? "Renovar / Novo Contrato" : "Atribuir Novo Contrato"}</CardTitle>
                        <CardDescription>
                            Selecione um plano para firmar um novo contrato manual com esta empresa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Selecionar Plano</Label>
                                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {planos.map(plan => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.nome} ({plan.meses} meses) - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.valor))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Início</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {selectedPlan && calculatedEndDate && (
                            <div className="bg-gray-100 p-4 rounded-md flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-gray-500">Previsão de Término:</span>
                                    <div className="font-bold text-gray-900">
                                        {format(calculatedEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500">Valor Total:</span>
                                    <div className="font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedPlan.valor))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAssign} disabled={isLoading || !selectedPlanId} className="w-full md:w-auto">
                            {isLoading ? "Processando..." : "Firmar Contrato"}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
