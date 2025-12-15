"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteEmpresa } from "@/app/actions/admin-actions"
import { useState } from "react"

interface ExcluirEmpresaDialogProps {
    id: string
    nome: string
}

export function ExcluirEmpresaDialog({ id, nome }: ExcluirEmpresaDialogProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDeleting(true)

        await deleteEmpresa(id)

        setIsDeleting(false)
        setOpen(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Empresa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você tem certeza que deseja excluir a empresa <strong>{nome}</strong>?
                        <br /><br />
                        <span className="text-red-600 font-bold">Atenção:</span> Esta ação não pode ser desfeita.
                        Todos os usuários, clientes, colaboradores, serviços e agendamentos vinculados a esta empresa serão permanentemente removidos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
