'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { editarColaborador } from '@/actions/colaboradores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

const initialState = {
    message: '',
    errors: {} as {
        nome?: string[]
        email?: string[]
        senha?: string[]
        _form?: string[]
    }
}

interface FormEditarColaboradorProps {
    colaborador: {
        id: string
        nome: string
        email: string
    }
    onSuccess?: () => void
}

export function FormEditarColaborador({ collaborator, onSuccess }: any) {
    const [state, dispatch] = useActionState(editarColaborador, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (state.message === 'Colaborador atualizado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1000)
            }
        }
    }, [state.message, onSuccess])

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="id" value={collaborator.id} />

            <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input name="nome" id="nome" required defaultValue={collaborator.nome} />
                {state.errors?.nome && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.nome}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input name="email" id="email" type="email" required defaultValue={collaborator.email} />
                {state.errors?.email && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="senha">Nova Senha (opcional)</Label>
                <Input name="senha" id="senha" type="password" placeholder="Deixe em branco para manter a atual" />
                <p className="text-xs text-muted-foreground">
                    Preencha apenas se quiser alterar a senha.
                </p>
                {state.errors?.senha && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.senha}</p>
                )}
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
            {pending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
    )
}
