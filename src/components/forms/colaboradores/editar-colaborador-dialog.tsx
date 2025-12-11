"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FormEditarColaborador } from "./form-editar-colaborador"
import { Pencil } from "lucide-react"
import { useState } from "react"

interface EditarColaboradorDialogProps {
    colaborador: {
        id: string
        nome: string
        email: string
        foto?: string | null
        servicos?: any[]
    }
    servicos?: any[]
}

export function EditarColaboradorDialog({ colaborador, servicos }: EditarColaboradorDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Colaborador</DialogTitle>
                    <DialogDescription>
                        Faça alterações nos dados do colaborador abaixo.
                    </DialogDescription>
                </DialogHeader>
                <FormEditarColaborador collaborator={colaborador} servicos={servicos} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
