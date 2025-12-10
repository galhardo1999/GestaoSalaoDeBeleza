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
    }
}

export function EditarColaboradorDialog({ colaborador }: EditarColaboradorDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Colaborador</DialogTitle>
                    <DialogDescription>
                        Faça alterações nos dados do colaborador abaixo.
                    </DialogDescription>
                </DialogHeader>
                <FormEditarColaborador collaborator={colaborador} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
