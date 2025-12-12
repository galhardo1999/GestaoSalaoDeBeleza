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
import { FormNovoColaborador } from "./form-novo-colaborador"
import { Plus } from "lucide-react"
import { useState } from "react"

export function NovoColaboradorDialog({ servicos, children }: { servicos: any[], children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Colaborador</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para cadastrar um novo colaborador.
                    </DialogDescription>
                </DialogHeader>
                <FormNovoColaborador onSuccess={() => setOpen(false)} servicos={servicos} />
            </DialogContent>
        </Dialog>
    )
}
