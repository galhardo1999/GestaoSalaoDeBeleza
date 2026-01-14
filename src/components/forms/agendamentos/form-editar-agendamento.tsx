'use client'

import { useActionState, useState, useEffect } from 'react'
import { editarAgendamento } from '@/actions/agendamentos'
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
import { SubmitButton } from '@/components/common/submit-button'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface FormEditarAgendamentoProps {
    agendamento: {
        id: string
        data: Date
        clienteId: string
        colaboradorId: string | null
        observacoes: string | null
        valor?: number | null
        itens?: {
            id: string
            servico: { id: string; nome: string }
            colaborador: { id: string; nome: string }
            preco: number
            duracao: number
        }[]
        servico?: { id?: string; nome: string; preco: any } | null
    }
    clientes: { id: string; nome: string }[]
    servicos: { id: string; nome: string; preco: any }[]
    colaboradores: { id: string; nome: string }[]
    onSuccess?: () => void
}

interface ServiceItem {
    key: string
    servicoId: string
    colaboradorId: string
    valor: string
}

const initialState = {
    message: '',
    errors: {} as {
        clienteId?: string[]
        servicoId?: string[]
        data?: string[]
        colaboradorId?: string[]
        servicos?: string[]
        _form?: string[]
    },
    success: false
}

const generateKey = () => Math.random().toString(36).substring(7)

export function FormEditarAgendamento({ agendamento, clientes, servicos, colaboradores, onSuccess }: FormEditarAgendamentoProps) {
    const updateAction = editarAgendamento.bind(null, agendamento.id)
    const [state, dispatch] = useActionState(updateAction, initialState)

    // Initialize date/time from agendamento
    const [date, setDate] = useState(format(new Date(agendamento.data), 'yyyy-MM-dd'))
    const [time, setTime] = useState(format(new Date(agendamento.data), 'HH:mm'))

    // Multi-service state - initialize from itens or servico
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>(() => {
        // If we have itens (multi-service), use those
        if (agendamento.itens && agendamento.itens.length > 0) {
            return agendamento.itens.map(item => ({
                key: generateKey(),
                servicoId: item.servico.id,
                colaboradorId: item.colaborador?.id || '',
                valor: Number(item.preco).toFixed(2)
            }))
        }
        // Otherwise, try to use the single servico (backward compatibility)
        return [{
            key: generateKey(),
            servicoId: agendamento.servico?.id || '',
            colaboradorId: agendamento.colaboradorId || '',
            valor: Number(agendamento.valor || agendamento.servico?.preco || 0).toFixed(2)
        }]
    })

    useEffect(() => {
        if (state.success && onSuccess) {
            onSuccess()
        }
    }, [state.success, onSuccess])

    const handleServiceChange = (key: string, servicoId: string) => {
        setServiceItems(prev => prev.map(item => {
            if (item.key === key) {
                const service = servicos.find(s => s.id === servicoId)
                return {
                    ...item,
                    servicoId,
                    valor: service ? Number(service.preco).toFixed(2) : ''
                }
            }
            return item
        }))
    }

    const handleColaboradorChange = (key: string, colaboradorId: string) => {
        setServiceItems(prev => prev.map(item =>
            item.key === key ? { ...item, colaboradorId } : item
        ))
    }

    const handleValorChange = (key: string, valor: string) => {
        setServiceItems(prev => prev.map(item =>
            item.key === key ? { ...item, valor } : item
        ))
    }

    const addService = () => {
        setServiceItems(prev => [...prev, { key: generateKey(), servicoId: '', colaboradorId: '', valor: '' }])
    }

    const removeService = (key: string) => {
        if (serviceItems.length > 1) {
            setServiceItems(prev => prev.filter(item => item.key !== key))
        }
    }

    const dateTimeValue = date && time ? `${date}T${time}` : ''

    // Calculate total
    const total = serviceItems.reduce((acc, item) => {
        const val = parseFloat(item.valor)
        return acc + (isNaN(val) ? 0 : val)
    }, 0)

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="data" value={dateTimeValue} />
            <input type="hidden" name="valor" value={total.toFixed(2)} />
            <input type="hidden" name="servicos" value={JSON.stringify(
                serviceItems.map(item => ({
                    servicoId: item.servicoId,
                    colaboradorId: item.colaboradorId,
                    valor: item.valor
                }))
            )} />

            {/* Data e Hora */}
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
                    onSelect={() => { }}
                    initialValue={agendamento.clienteId}
                />
                {state.errors?.clienteId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.clienteId}</p>
                )}
            </div>

            {/* Serviços */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Serviços</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addService}
                        className="h-8 gap-1 text-xs"
                    >
                        <Plus className="h-3 w-3" />
                        Adicionar Serviço
                    </Button>
                </div>

                <div className="space-y-3">
                    {serviceItems.map((item, index) => (
                        <div
                            key={item.key}
                            className={cn(
                                "grid gap-3 p-3 rounded-lg border bg-slate-50/50",
                                serviceItems.length > 1 ? "grid-cols-[1fr_1fr_100px_32px]" : "grid-cols-[1fr_1fr_100px]"
                            )}
                        >
                            {/* Serviço */}
                            <div className="space-y-1">
                                {index === 0 && <Label className="text-xs text-muted-foreground">Serviço</Label>}
                                <Select
                                    value={item.servicoId}
                                    onValueChange={(value) => handleServiceChange(item.key, value)}
                                >
                                    <SelectTrigger className="bg-white">
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

                            {/* Colaborador */}
                            <div className="space-y-1">
                                {index === 0 && <Label className="text-xs text-muted-foreground">Colaborador</Label>}
                                <Select
                                    value={item.colaboradorId}
                                    onValueChange={(value) => handleColaboradorChange(item.key, value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecione" />
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

                            {/* Valor */}
                            <div className="space-y-1">
                                {index === 0 && <Label className="text-xs text-muted-foreground">Valor</Label>}
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.valor}
                                    onChange={(e) => handleValorChange(item.key, e.target.value)}
                                    placeholder="0.00"
                                    className="bg-white"
                                />
                            </div>

                            {/* Remove button */}
                            {serviceItems.length > 1 && (
                                <div className={cn("flex items-end", index === 0 && "pb-0")}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeService(item.key)}
                                        className={cn(
                                            "h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50",
                                            index === 0 && "mt-4"
                                        )}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {state.errors?.servicos && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.servicos}</p>
                )}
                {state.errors?.servicoId && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.servicoId}</p>
                )}

                {/* Total */}
                <div className="flex justify-end items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-lg font-semibold">{formatCurrency(total)}</span>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea
                    name="observacoes"
                    id="observacoes"
                    defaultValue={agendamento.observacoes || ""}
                />
            </div>

            {/* Botão de Envio */}
            <SubmitButton submitText="Salvar Alterações" loadingText="Salvando..." />

            {state.message && (
                <p className="text-sm font-medium text-red-500 mt-2">{state.message}</p>
            )}
        </form>
    )
}
