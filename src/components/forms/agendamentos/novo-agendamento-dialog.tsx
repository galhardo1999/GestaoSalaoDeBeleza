"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FormNovoAgendamento } from "./form-novo-agendamento"
import { Plus } from "lucide-react"

interface NovoAgendamentoDialogProps {
    clientes: { id: string; nome: string }[]
    servicos: { id: string; nome: string; preco: any }[]
    colaboradores: { id: string; nome: string }[]
}

export function NovoAgendamentoDialog({ clientes, servicos, colaboradores }: NovoAgendamentoDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do agendamento abaixo.
                    </DialogDescription>
                </DialogHeader>
                <FormNovoAgendamento
                    clientes={clientes}
                    servicos={servicos}
                    colaboradores={colaboradores}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
