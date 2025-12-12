'use client'

import { cancelarAgendamento } from "@/actions/agendamentos"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import React from "react"

export function BotaoCancelarAgendamento({ id, children }: { id: string, children?: React.ReactNode }) {
    const [isPending, startTransition] = useTransition()

    const handleCancel = () => {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            startTransition(() => cancelarAgendamento(id))
        }
    }

    if (children) {
        return (
            <span onClick={handleCancel}>
                {children}
            </span>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            disabled={isPending}
            title="Cancelar Agendamento"
            onClick={handleCancel}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
