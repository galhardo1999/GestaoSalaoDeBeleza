"use client"

import { FormDialog } from "@/components/common"
import { FormNovoCliente } from "./form-novo-cliente"

interface NovoClienteDialogProps {
    /** Elemento trigger customizado */
    children?: React.ReactNode
}

/**
 * Dialog para criar um novo cliente.
 * Usa o FormDialog unificado para gerenciamento de estado.
 */
export function NovoClienteDialog({ children }: NovoClienteDialogProps) {
    return (
        <FormDialog
            title="Novo Cliente"
            description="Cadastre um novo cliente no sistema."
            trigger={children}
            triggerText="Novo Cliente"
        >
            {({ onSuccess }) => <FormNovoCliente onSuccess={onSuccess} />}
        </FormDialog>
    )
}
