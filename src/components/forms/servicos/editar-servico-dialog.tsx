'use client'

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common"
import { FormEditarServico } from "./form-editar-servico"
import { Pencil } from "lucide-react"

interface EditarServicoDialogProps {
    servico: {
        id: string
        nome: string
        preco: number
        duracaoMin: number
    }
}

/**
 * Dialog para editar um serviço existente.
 * Usa o FormDialog unificado para gerenciamento de estado.
 */
export function EditarServicoDialog({ servico }: EditarServicoDialogProps) {
    return (
        <FormDialog
            title="Editar Serviço"
            description="Faça alterações nos dados do serviço abaixo."
            trigger={
                <Button variant="ghost" size="icon" className="hover:bg-muted" title="Editar Serviço">
                    <Pencil className="h-4 w-4" />
                </Button>
            }
        >
            {({ onSuccess }) => <FormEditarServico servico={servico} onSuccess={onSuccess} />}
        </FormDialog>
    )
}
