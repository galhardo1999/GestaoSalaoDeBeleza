'use client'

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common"
import { FormEditarCliente } from "./form-editar-cliente"
import { Pencil } from "lucide-react"

interface EditarClienteDialogProps {
    cliente: {
        id: string
        nome: string
        email: string | null
        cpf: string | null
        telefone: string
        observacoes: string | null
        dataNascimento: Date | null
    }
    children?: React.ReactNode
}

/**
 * Dialog para editar um cliente existente.
 * Usa o FormDialog unificado para gerenciamento de estado.
 */
export function EditarClienteDialog({ cliente, children }: EditarClienteDialogProps) {
    const defaultTrigger = (
        <Button variant="ghost" size="icon" className="hover:bg-muted" title="Editar Cliente">
            <Pencil className="h-4 w-4" />
        </Button>
    )

    return (
        <FormDialog
            title="Editar Cliente"
            description="Faça alterações nos dados do cliente abaixo."
            trigger={children ?? defaultTrigger}
        >
            {({ onSuccess }) => <FormEditarCliente cliente={cliente} onSuccess={onSuccess} />}
        </FormDialog>
    )
}
