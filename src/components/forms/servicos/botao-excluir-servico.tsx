'use client'

import { excluirServico } from "@/actions/servicos"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function BotaoExcluirServico({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={isPending}
            onClick={() => {
                if (confirm('Tem certeza que deseja excluir este serviço?')) {
                    startTransition(() => excluirServico(id))
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
