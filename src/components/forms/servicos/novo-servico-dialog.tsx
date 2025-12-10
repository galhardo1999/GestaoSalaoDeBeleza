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
import { FormNovoServico } from "./form-novo-servico"
import { Plus } from "lucide-react"
import { useState } from "react"

export function NovoServicoDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Serviço</DialogTitle>
                    <DialogDescription>
                        Cadastre um novo serviço no sistema.
                    </DialogDescription>
                </DialogHeader>
                <FormNovoServico onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
