'use client'

import { cancelarAgendamento } from "@/actions/agendamentos"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { useTransition } from "react"

export function BotaoCancelarAgendamento({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={isPending}
            title="Cancelar Agendamento"
            onClick={() => {
                if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                    startTransition(() => cancelarAgendamento(id))
                }
            }}
        >
            <XCircle className="h-4 w-4" />
        </Button>
    )
}
