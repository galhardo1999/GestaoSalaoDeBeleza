"use client"

import { FormDialog } from "@/components/common"
import { FormNovoColaborador } from "./form-novo-colaborador"

interface NovoColaboradorDialogProps {
    /** Lista de serviços disponíveis */
    servicos: any[]
    /** Elemento trigger customizado */
    children?: React.ReactNode
}

/**
 * Dialog para criar um novo colaborador.
 * Usa o FormDialog unificado para gerenciamento de estado.
 */
export function NovoColaboradorDialog({ servicos, children }: NovoColaboradorDialogProps) {
    return (
        <FormDialog
            title="Novo Colaborador"
            description="Preencha os dados para cadastrar um novo colaborador."
            trigger={children}
            triggerText="Novo Colaborador"
            scrollable
            contentClassName="sm:max-w-[600px]"
        >
            {({ onSuccess }) => <FormNovoColaborador onSuccess={onSuccess} servicos={servicos} />}
        </FormDialog>
    )
}
