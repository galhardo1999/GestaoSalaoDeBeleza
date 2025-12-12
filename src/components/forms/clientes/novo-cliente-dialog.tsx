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
import { FormNovoCliente } from "./form-novo-cliente"
import { Plus } from "lucide-react"
import { useState } from "react"

export function NovoClienteDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>
                        Cadastre um novo cliente no sistema.
                    </DialogDescription>
                </DialogHeader>
                <FormNovoCliente onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
