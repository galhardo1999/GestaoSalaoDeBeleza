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
import { FormEditarServico } from "./form-editar-servico"
import { Pencil } from "lucide-react"
import { useState } from "react"

interface EditarServicoDialogProps {
    servico: {
        id: string
        nome: string
        preco: number
        duracaoMin: number
    }
}

export function EditarServicoDialog({ servico }: EditarServicoDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted" title="Editar Serviço">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Serviço</DialogTitle>
                    <DialogDescription>
                        Faça alterações nos dados do serviço abaixo.
                    </DialogDescription>
                </DialogHeader>
                <FormEditarServico servico={servico} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
