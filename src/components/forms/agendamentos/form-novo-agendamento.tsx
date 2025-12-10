'use client'

import { useActionState } from 'react' // React 19
import { useFormStatus } from 'react-dom'
import { criarAgendamento } from '@/actions/agendamentos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface FormNovoAgendamentoProps {
    clientes: { id: string; nome: string }[]
    servicos: { id: string; nome: string; preco: any }[] // preco is Decimal
}

const initialState = {
    message: '',
    errors: {} as {
        clienteId?: string[]
        servicoId?: string[]
        data?: string[]
        _form?: string[]
    }
}

export function FormNovoAgendamento({ clientes, servicos }: FormNovoAgendamentoProps) {
    const [state, dispatch] = useActionState(criarAgendamento, initialState)

    return (
        <form action={dispatch} className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <Select name="clienteId" defaultValue="">
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state.errors?.clienteId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.clienteId}</p>
                )}
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
                <Label htmlFor="servicoId">Serviço</Label>
                <Select name="servicoId" defaultValue="">
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                        {servicos.map((servico) => (
                            <SelectItem key={servico.id} value={servico.id}>
                                {servico.nome} - R$ {Number(servico.preco).toFixed(2)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state.errors?.servicoId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.servicoId}</p>
                )}
            </div>

            {/* Date & Time Picker */}
            <div className="space-y-2">
                <Label htmlFor="data">Data e Hora</Label>
                <Input
                    type="datetime-local"
                    name="data"
                    id="data"
                    required
                />
                {state.errors?.data && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.data}</p>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea name="observacoes" id="observacoes" placeholder="" />
            </div>

            {/* Submit Button */}
            <SubmitButton />

            {state.message && (
                <p className="text-sm font-medium text-red-500 mt-2">{state.message}</p>
            )}
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
    )
}
