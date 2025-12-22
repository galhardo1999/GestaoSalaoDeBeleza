'use client'

import { useActionState, useState } from 'react' // React 19
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
import { ComboboxCliente } from './combobox-cliente'

interface FormNovoAgendamentoProps {
    clientes: { id: string; nome: string }[]
    servicos: { id: string; nome: string; preco: any }[] // preco é Decimal
    colaboradores: { id: string; nome: string }[]
}

const initialState = {
    message: '',
    errors: {} as {
        clienteId?: string[]
        servicoId?: string[]
        data?: string[]
        colaboradorId?: string[]
        _form?: string[]
    }
}

export function FormNovoAgendamento({ clientes, servicos, colaboradores }: FormNovoAgendamentoProps) {
    const [state, dispatch] = useActionState(criarAgendamento, initialState)
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [selectedServiceId, setSelectedServiceId] = useState('')
    const [price, setPrice] = useState('')

    // Update price when service changes
    const handleServiceChange = (serviceId: string) => {
        setSelectedServiceId(serviceId)
        const service = servicos.find(s => s.id === serviceId)
        if (service) {
            setPrice(Number(service.preco).toFixed(2)) // Default to service price
        }
    }

    const dateTimeValue = date && time ? `${date}T${time}` : ''

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="data" value={dateTimeValue} />
            <input type="hidden" name="valor" value={price} />

            {/* Data e Hora separados */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date-input">Data</Label>
                    <Input
                        type="date"
                        id="date-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time-input">Hora</Label>
                    <Input
                        type="time"
                        id="time-input"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>
            </div>
            {state.errors?.data && (
                <p className="text-sm text-red-500 font-medium">{state.errors.data}</p>
            )}

            {/* Seleção de Cliente */}
            <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <ComboboxCliente
                    clientes={clientes}
                    onSelect={(id) => { console.log('Selected client:', id) }}
                />
                {state.errors?.clienteId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.clienteId}</p>
                )}
            </div>

            {/* Serviço e Valor separados */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="servicoId">Serviço</Label>
                    <Select name="servicoId" value={selectedServiceId} onValueChange={handleServiceChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {servicos.map((servico) => (
                                <SelectItem key={servico.id} value={servico.id}>
                                    {servico.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {state.errors?.servicoId && (
                        <p className="text-sm text-red-500 font-medium">{state.errors.servicoId}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Seleção de Colaborador */}
            <div className="space-y-2">
                <Label htmlFor="colaboradorId">Colaborador</Label>
                <Select name="colaboradorId" defaultValue="">
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                        {colaboradores.map((colaborador) => (
                            <SelectItem key={colaborador.id} value={colaborador.id}>
                                {colaborador.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state.errors?.colaboradorId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.colaboradorId}</p>
                )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea name="observacoes" id="observacoes" placeholder="" />
            </div>

            {/* Botão de Envio */}
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
