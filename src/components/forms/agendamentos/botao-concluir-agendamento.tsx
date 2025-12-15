'use client'

import { concluirAgendamento } from "@/actions/agendamentos"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useTransition } from "react"
import React from "react"

export function BotaoConcluirAgendamento({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    const handleConclude = () => {
        if (confirm('Tem certeza que deseja marcar este agendamento como concluído?')) {
            startTransition(() => concluirAgendamento(id))
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            disabled={isPending}
            title="Concluir Atendimento"
            onClick={handleConclude}
        >
            <CheckCircle className="w-4 h-4" />
        </Button>
    )
}
