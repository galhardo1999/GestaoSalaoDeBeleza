"use client"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common"
import { FormEditarColaborador } from "./form-editar-colaborador"
import { Pencil } from "lucide-react"

interface EditarColaboradorDialogProps {
    colaborador: {
        id: string
        nome: string
        email: string
        foto?: string | null
        servicos?: any[]
    }
    servicos?: any[]
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

/**
 * Dialog para editar um colaborador existente.
 * Usa o FormDialog unificado para gerenciamento de estado.
 */
export function EditarColaboradorDialog({ colaborador, servicos, children, open, onOpenChange }: EditarColaboradorDialogProps) {
    const defaultTrigger = (
        <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Pencil className="h-4 w-4" />
        </Button>
    )

    return (
        <FormDialog
            title="Editar Colaborador"
            description="Faça alterações nos dados do colaborador abaixo."
            trigger={children ?? defaultTrigger}
            scrollable
            contentClassName="sm:max-w-[600px]"
            open={open}
            onOpenChange={onOpenChange}
        >
            {({ onSuccess }) => (
                <FormEditarColaborador
                    collaborator={colaborador}
                    servicos={servicos}
                    onSuccess={onSuccess}
                />
            )}
        </FormDialog>
    )
}
