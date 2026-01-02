'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
    /** Texto exibido enquanto o formulário está sendo enviado */
    loadingText?: string
    /** Texto exibido no botão em estado normal */
    submitText?: string
    /** Classes CSS adicionais */
    className?: string
    /** Variante do botão */
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    /** Desabilitar botão independente do estado do formulário */
    disabled?: boolean
    /** Mostrar ícone de loading */
    showLoadingIcon?: boolean
}

/**
 * Componente de botão de submit reutilizável que integra com React Server Actions.
 * Automaticamente detecta o estado pendente do formulário usando useFormStatus.
 * 
 * @example
 * ```tsx
 * <form action={myServerAction}>
 *   <SubmitButton submitText="Salvar Cliente" loadingText="Salvando..." />
 * </form>
 * ```
 */
export function SubmitButton({
    loadingText = 'Salvando...',
    submitText = 'Salvar',
    className,
    variant = 'default',
    disabled = false,
    showLoadingIcon = true,
}: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            variant={variant}
            className={cn('w-full', className)}
            disabled={pending || disabled}
        >
            {pending && showLoadingIcon && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {pending ? loadingText : submitText}
        </Button>
    )
}
