'use client'

import { excluirColaborador } from "@/actions/colaboradores"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function BotaoExcluirColaborador({ id, children }: { id: string, children?: React.ReactNode }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este colaborador?')) {
            startTransition(() => excluirColaborador(id))
        }
    }

    if (children) {
        return (
            <span onClick={handleDelete}>
                {children}
            </span>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={isPending}
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
