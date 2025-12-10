'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { criarCliente } from '@/actions/clientes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'

const initialState = {
    message: '',
    errors: {} as {
        nome?: string[]
        email?: string[]
        telefone?: string[]
        _form?: string[]
    }
}

export function FormNovoCliente({ onSuccess }: { onSuccess?: () => void }) {
    const [state, dispatch] = useActionState(criarCliente, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (state.message === 'Cliente cadastrado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
                // Delay slightly to show success message or just close
                setTimeout(() => onSuccess(), 1000)
            }
        }
    }, [state.message, onSuccess])

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label>Código</Label>
                <Input disabled value="Gerado automaticamente" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input name="nome" id="nome" required placeholder="Ex: Maria Silva" />
                {state.errors?.nome && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.nome}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input name="telefone" id="telefone" required placeholder="(11) 99999-9999" />
                {state.errors?.telefone && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.telefone}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" placeholder="maria@email.com" />
                {state.errors?.email && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea name="observacoes" id="observacoes" placeholder="" />
            </div>

            <SubmitButton />

            {state.message && (
                <p className={`text-sm font-medium mt-2 ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar Cliente'}
        </Button>
    )
}
