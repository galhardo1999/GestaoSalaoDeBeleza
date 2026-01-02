'use client'

import { useActionState } from 'react'
import { editarServico } from '@/actions/servicos'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { SubmitButton } from '@/components/common/submit-button'

const initialState = {
    message: '',
    errors: {} as {
        nome?: string[]
        preco?: string[]
        duracaoMin?: string[]
        _form?: string[]
    }
}

interface FormEditarServicoProps {
    servico: {
        id: string
        nome: string
        preco: number
        duracaoMin: number
    }
    onSuccess?: () => void
}

export function FormEditarServico({ servico, onSuccess }: FormEditarServicoProps) {
    const [state, dispatch] = useActionState(editarServico, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (state.message === 'Serviço atualizado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1000)
            }
        }
    }, [state.message, onSuccess])

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="id" value={servico.id} />

            <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input name="nome" id="nome" required defaultValue={servico.nome} />
                {state.errors?.nome && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.nome}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <NumericFormat
                        customInput={Input}
                        name="preco"
                        id="preco"
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        required
                        defaultValue={servico.preco}
                    />
                    {state.errors?.preco && (
                        <p className="text-sm text-red-500 font-medium">{state.errors.preco}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duracaoMin">Duração (minutos) *</Label>
                    <Input
                        name="duracaoMin"
                        id="duracaoMin"
                        type="number"
                        required
                        min="5"
                        step="5"
                        defaultValue={servico.duracaoMin}
                    />
                    {state.errors?.duracaoMin && (
                        <p className="text-sm text-red-500 font-medium">{state.errors.duracaoMin}</p>
                    )}
                </div>
            </div>

            <SubmitButton submitText="Salvar Alterações" />

            {state.message && (
                <p className={`text-sm font-medium mt-2 ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}
