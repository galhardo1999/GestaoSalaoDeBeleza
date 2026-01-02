"use client"

import { FormDialog } from "@/components/common"
import { FormNovoServico } from "./form-novo-servico"

/**
 * Dialog para criar um novo serviço.
 * Usa o FormDialog unificado para gerenciamento de estado.
 */
export function NovoServicoDialog() {
    return (
        <FormDialog
            title="Novo Serviço"
            description="Cadastre um novo serviço no sistema."
            triggerText="Novo Serviço"
        >
            {({ onSuccess }) => <FormNovoServico onSuccess={onSuccess} />}
        </FormDialog>
    )
}
