'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTransition, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DeleteButtonProps {
    /** ID do item a ser excluído */
    id: string
    /** Função de exclusão que recebe o ID */
    onDelete: (id: string) => Promise<void | { error?: string; message?: string }>
    /** Mensagem de confirmação exibida no alert */
    confirmMessage?: string
    /** Conteúdo filho (quando usado como wrapper) */
    children?: ReactNode
    /** Variante visual do botão */
    variant?: 'default' | 'ghost' | 'destructive' | 'outline'
    /** Tamanho do botão */
    size?: 'default' | 'sm' | 'lg' | 'icon'
    /** Classes CSS adicionais */
    className?: string
    /** Título/tooltip do botão */
    title?: string
    /** Callback executado em caso de erro */
    onError?: (error: string) => void
    /** Callback executado em caso de sucesso */
    onSuccess?: () => void
}

/**
 * Componente de botão de exclusão reutilizável.
 * Inclui confirmação via window.confirm e gerenciamento de estado pendente.
 * 
 * @example
 * ```tsx
 * // Como botão de ícone
 * <DeleteButton 
 *   id={cliente.id} 
 *   onDelete={excluirCliente}
 *   confirmMessage="Tem certeza que deseja excluir este cliente?"
 * />
 * 
 * // Como wrapper para outro elemento
 * <DeleteButton id={item.id} onDelete={excluirItem}>
 *   <DropdownMenuItem>Excluir</DropdownMenuItem>
 * </DeleteButton>
 * ```
 */
export function DeleteButton({
    id,
    onDelete,
    confirmMessage = 'Tem certeza que deseja excluir este item?',
    children,
    variant = 'ghost',
    size = 'icon',
    className,
    title = 'Excluir',
    onError,
    onSuccess,
}: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (confirm(confirmMessage)) {
            startTransition(async () => {
                const result = await onDelete(id)
                if (result && 'error' in result && result.error) {
                    if (onError) {
                        onError(result.error)
                    } else {
                        alert(result.error)
                    }
                } else if (onSuccess) {
                    onSuccess()
                }
            })
        }
    }

    // Quando usado como wrapper para outro elemento
    if (children) {
        return (
            <span onClick={handleDelete} className={cn(isPending && 'opacity-50 pointer-events-none')}>
                {children}
            </span>
        )
    }

    // Botão padrão de ícone
    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                'text-red-500 hover:text-red-700 hover:bg-red-50',
                className
            )}
            disabled={isPending}
            onClick={handleDelete}
            title={title}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
