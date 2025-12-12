'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FormEditarCliente } from "./form-editar-cliente"
import { Pencil } from "lucide-react"
import { useState } from "react"

interface EditarClienteDialogProps {
    cliente: {
        id: string
        nome: string
        email: string | null
        cpf: string | null
        telefone: string
        observacoes: string | null
    }
    children?: React.ReactNode
}

export function EditarClienteDialog({ cliente, children }: EditarClienteDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button variant="ghost" size="icon" className="hover:bg-muted" title="Editar Cliente">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                        Faça alterações nos dados do cliente abaixo.
                    </DialogDescription>
                </DialogHeader>
                <FormEditarCliente cliente={cliente} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
