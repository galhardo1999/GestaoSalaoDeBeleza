'use client'

import { Button } from '@/components/ui/button'
import { useTransition, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ActionButtonProps {
    /** ID do item sobre o qual a ação será executada */
    id: string
    /** Função de ação que recebe o ID */
    onAction: (id: string) => Promise<void>
    /** Mensagem de confirmação (se não fornecida, não pede confirmação) */
    confirmMessage?: string
    /** Conteúdo filho (quando usado como wrapper) */
    children?: ReactNode
    /** Ícone do botão */
    icon?: LucideIcon
    /** Variante visual do botão */
    variant?: 'default' | 'ghost' | 'destructive' | 'outline' | 'secondary'
    /** Tamanho do botão */
    size?: 'default' | 'sm' | 'lg' | 'icon'
    /** Classes CSS adicionais */
    className?: string
    /** Título/tooltip do botão */
    title?: string
    /** Esquema de cores predefinido */
    colorScheme?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const colorSchemes = {
    default: '',
    success: 'text-teal-600 hover:text-teal-700 hover:bg-teal-50',
    warning: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
    danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    info: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
}

/**
 * Componente de botão de ação reutilizável para operações genéricas.
 * Suporta confirmação opcional e gerenciamento de estado pendente.
 * 
 * @example
 * ```tsx
 * // Botão de confirmar agendamento
 * <ActionButton
 *   id={agendamento.id}
 *   onAction={confirmarAgendamento}
 *   confirmMessage="Tem certeza que deseja confirmar?"
 *   icon={Check}
 *   colorScheme="success"
 *   title="Confirmar Agendamento"
 * />
 * 
 * // Botão de concluir sem confirmação
 * <ActionButton
 *   id={agendamento.id}
 *   onAction={concluirAgendamento}
 *   icon={CheckCircle}
 *   colorScheme="info"
 *   title="Concluir"
 * />
 * ```
 */
export function ActionButton({
    id,
    onAction,
    confirmMessage,
    children,
    icon: Icon,
    variant = 'ghost',
    size = 'icon',
    className,
    title,
    colorScheme = 'default',
}: ActionButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleAction = () => {
        if (confirmMessage) {
            if (!confirm(confirmMessage)) {
                return
            }
        }
        startTransition(() => onAction(id))
    }

    // Quando usado como wrapper para outro elemento
    if (children) {
        return (
            <span onClick={handleAction} className={cn(isPending && 'opacity-50 pointer-events-none')}>
                {children}
            </span>
        )
    }

    // Botão padrão
    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                'h-8 w-8',
                colorSchemes[colorScheme],
                className
            )}
            disabled={isPending}
            onClick={handleAction}
            title={title}
        >
            {Icon && <Icon className="h-4 w-4" />}
        </Button>
    )
}
