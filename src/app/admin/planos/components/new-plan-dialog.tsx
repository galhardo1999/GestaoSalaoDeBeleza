"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useState } from "react"
import { createPlan } from "@/actions/admin/planos"
import { useRouter } from "next/navigation"

export function NewPlanDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        const nome = formData.get("nome") as string
        const meses = parseInt(formData.get("meses") as string)
        const valor = parseFloat(formData.get("valor") as string)
        const descricao = formData.get("descricao") as string

        const result = await createPlan({ nome, meses, valor, descricao })

        if (result.success) {
            alert("Plano criado com sucesso!")
            setOpen(false)
            router.refresh()
        } else {
            alert(result.error || "Erro ao criar plano")
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Plano
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Plano</DialogTitle>
                    <DialogDescription>
                        Crie um novo plano de assinatura para as empresas.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome do Plano</Label>
                        <Input id="nome" name="nome" placeholder="Ex: Semestral" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="meses">Duração (Meses)</Label>
                            <Input id="meses" name="meses" type="number" min="1" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="valor">Valor (R$)</Label>
                            <Input id="valor" name="valor" type="number" step="0.01" min="0" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="descricao">Descrição (Opcional)</Label>
                        <Input id="descricao" name="descricao" placeholder="Detalhes do plano..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar Plano"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
