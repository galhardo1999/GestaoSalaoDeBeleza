'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { criarServico } from '@/actions/servicos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

const initialState = {
    message: '',
    errors: {} as {
        nome?: string[]
        preco?: string[]
        duracaoMin?: string[]
        _form?: string[]
    }
}

export function FormNovoServico({ onSuccess }: { onSuccess?: () => void }) {
    const [state, dispatch] = useActionState(criarServico, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (state.message === 'Serviço cadastrado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1000)
            }
        }
    }, [state.message, onSuccess])

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input name="nome" id="nome" required placeholder="Ex: Corte Masculino" />
                {state.errors?.nome && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.nome}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input name="preco" id="preco" type="number" step="0.01" required placeholder="50.00" />
                    {state.errors?.preco && (
                        <p className="text-sm text-red-500 font-medium">{state.errors.preco}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duracaoMin">Duração (min) *</Label>
                    <Input name="duracaoMin" id="duracaoMin" type="number" required placeholder="30" />
                    {state.errors?.duracaoMin && (
                        <p className="text-sm text-red-500 font-medium">{state.errors.duracaoMin}</p>
                    )}
                </div>
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
            {pending ? 'Salvando...' : 'Salvar Serviço'}
        </Button>
    )
}
