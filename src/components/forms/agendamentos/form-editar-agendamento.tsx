'use client'

import { useActionState, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { editarAgendamento } from '@/actions/agendamentos'
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
import { ComboboxCliente } from './combobox-cliente' // Assuming this exists shared
import { format } from 'date-fns'

interface FormEditarAgendamentoProps {
    agendamento: {
        id: string
        data: Date
        clienteId: string
        servicoId: string
        colaboradorId: string | null
        observacoes: string | null
        servico: { nome: string; preco: any }
    }
    clientes: { id: string; nome: string }[]
    servicos: { id: string; nome: string; preco: any }[]
    colaboradores: { id: string; nome: string }[]
    onSuccess?: () => void
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

export function FormEditarAgendamento({ agendamento, clientes, servicos, colaboradores, onSuccess }: FormEditarAgendamentoProps) {
    const updateAction = editarAgendamento.bind(null, agendamento.id)
    const [state, dispatch] = useActionState(updateAction, initialState)

    // Initial State from Props
    const [date, setDate] = useState(format(new Date(agendamento.data), 'yyyy-MM-dd'))
    const [time, setTime] = useState(format(new Date(agendamento.data), 'HH:mm'))
    const [selectedServiceId, setSelectedServiceId] = useState(agendamento.servicoId)
    const [price, setPrice] = useState(Number(agendamento.servico.preco).toFixed(2))

    useEffect(() => {
        if (state.success && onSuccess) {
            onSuccess()
        }
    }, [state.success, onSuccess])

    const handleServiceChange = (serviceId: string) => {
        setSelectedServiceId(serviceId)
        const service = servicos.find(s => s.id === serviceId)
        if (service) {
            setPrice(Number(service.preco).toFixed(2))
        }
    }

    const dateTimeValue = date && time ? `${date}T${time}` : ''

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="data" value={dateTimeValue} />
            <input type="hidden" name="valor" value={price} />

            <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente</Label>
                <ComboboxCliente
                    clientes={clientes}
                    onSelect={() => { }}
                    initialValue={agendamento.clienteId}
                />
                {state.errors?.clienteId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.clienteId}</p>
                )}
            </div>

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
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="colaboradorId">Colaborador</Label>
                <Select name="colaboradorId" defaultValue={agendamento.colaboradorId || ""}>
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
            </div>

            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                    name="observacoes"
                    id="observacoes"
                    defaultValue={agendamento.observacoes || ""}
                />
            </div>

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
            {pending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
    )
}
