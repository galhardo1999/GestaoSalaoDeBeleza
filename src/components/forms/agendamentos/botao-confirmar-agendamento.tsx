'use client'

import { confirmarAgendamento } from "@/actions/agendamentos"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useTransition } from "react"
import React from "react"

export function BotaoConfirmarAgendamento({ id, children }: { id: string, children?: React.ReactNode }) {
    const [isPending, startTransition] = useTransition()

    const handleConfirm = () => {
        if (confirm('Tem certeza que deseja confirmar este agendamento?')) {
            startTransition(() => confirmarAgendamento(id))
        }
    }

    if (children) {
        return (
            <span onClick={handleConfirm}>
                {children}
            </span>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-teal-600 hover:text-teal-700"
            disabled={isPending}
            title="Confirmar Agendamento"
            onClick={handleConfirm}
        >
            <Check className="h-4 w-4" />
        </Button>
    )
}
