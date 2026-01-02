"use client"

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormDialogProps {
    /** Título do dialog */
    title: string
    /** Descrição opcional do dialog */
    description?: string
    /** Conteúdo do formulário */
    children: ReactNode | ((props: { onSuccess: () => void }) => ReactNode)
    /** Elemento que dispara a abertura do dialog */
    trigger?: ReactNode
    /** Texto do botão padrão quando trigger não é fornecido */
    triggerText?: string
    /** Ícone do botão padrão */
    triggerIcon?: ReactNode
    /** Classes CSS adicionais para o content */
    contentClassName?: string
    /** Largura máxima do dialog */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    /** Se true, o dialog inicia aberto */
    defaultOpen?: boolean
    /** Controle externo do estado aberto (controlled mode) */
    open?: boolean
    /** Callback quando o estado muda (controlled mode) */
    onOpenChange?: (open: boolean) => void
    /** Se true, permite scroll no conteúdo */
    scrollable?: boolean
}

const maxWidthClasses = {
    sm: 'sm:max-w-[425px]',
    md: 'sm:max-w-[525px]',
    lg: 'sm:max-w-[625px]',
    xl: 'sm:max-w-[800px]',
    '2xl': 'sm:max-w-[1000px]',
}

/**
 * Componente de dialog reutilizável para formulários.
 * Gerencia automaticamente o estado de abertura e fechamento.
 * 
 * @example
 * ```tsx
 * // Uso simples com render prop
 * <FormDialog title="Novo Cliente" description="Cadastre um novo cliente">
 *   {({ onSuccess }) => <FormNovoCliente onSuccess={onSuccess} />}
 * </FormDialog>
 * 
 * // Com trigger customizado
 * <FormDialog 
 *   title="Editar" 
 *   trigger={<Button variant="outline">Editar</Button>}
 * >
 *   {({ onSuccess }) => <FormEditar onSuccess={onSuccess} />}
 * </FormDialog>
 * 
 * // Modo controlado
 * const [open, setOpen] = useState(false)
 * <FormDialog 
 *   title="Configurações" 
 *   open={open} 
 *   onOpenChange={setOpen}
 * >
 *   <FormConfiguracoes />
 * </FormDialog>
 * ```
 */
export function FormDialog({
    title,
    description,
    children,
    trigger,
    triggerText = "Novo",
    triggerIcon = <Plus className="mr-2 h-4 w-4" />,
    contentClassName,
    maxWidth = 'sm',
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    scrollable = false,
}: FormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)

    // Determina se estamos em modo controlado ou não
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    const handleSuccess = () => {
        setOpen(false)
    }

    // Renderiza o children, passando onSuccess se for uma função
    const renderContent = () => {
        if (typeof children === 'function') {
            return children({ onSuccess: handleSuccess })
        }
        return children
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        {triggerIcon}
                        {triggerText}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className={cn(
                    maxWidthClasses[maxWidth],
                    scrollable && 'max-h-[90vh] overflow-y-auto',
                    contentClassName
                )}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}
