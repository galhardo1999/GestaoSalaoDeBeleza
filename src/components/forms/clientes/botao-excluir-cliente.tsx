'use client'

import { excluirCliente } from "@/actions/clientes"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function BotaoExcluirCliente({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={isPending}
            onClick={() => {
                if (confirm('Tem certeza que deseja excluir este cliente?')) {
                    startTransition(async () => {
                        const result = await excluirCliente(id)
                        if (result?.error) {
                            alert(result.error)
                        }
                    })
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
