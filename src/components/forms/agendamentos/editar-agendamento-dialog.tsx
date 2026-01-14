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
import { FormEditarAgendamento } from "./form-editar-agendamento"
import { Pencil } from "lucide-react"

interface EditarAgendamentoDialogProps {
    agendamento: any // Using any for brevity given the nested structure, defined in Form
    clientes: { id: string; nome: string }[]
    servicos: { id: string; nome: string; preco: any }[]
    colaboradores: { id: string; nome: string }[]
}

export function EditarAgendamentoDialog({ agendamento, clientes, servicos, colaboradores }: EditarAgendamentoDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50" title="Editar">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Agendamento</DialogTitle>
                    <DialogDescription>
                        Altere os dados do agendamento abaixo.
                    </DialogDescription>
                </DialogHeader>
                <FormEditarAgendamento
                    agendamento={agendamento}
                    clientes={clientes}
                    servicos={servicos}
                    colaboradores={colaboradores}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
