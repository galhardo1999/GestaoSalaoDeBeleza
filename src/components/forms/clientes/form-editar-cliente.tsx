'use client'

import { useActionState } from 'react'
import { editarCliente } from '@/actions/clientes'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import { IMaskInput } from "react-imask"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmitButton } from '@/components/common/submit-button'
import type { ClienteActionState } from '@/types/actions'

const initialState: ClienteActionState = {
    message: '',
    errors: {}
}

interface FormEditarClienteProps {
    cliente: {
        id: string
        nome: string
        email: string | null
        cpf: string | null
        telefone: string
        observacoes: string | null
    }
    onSuccess?: () => void
}

export function FormEditarCliente({ cliente, onSuccess }: FormEditarClienteProps) {
    const [state, dispatch] = useActionState(editarCliente, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (state.message === 'Cliente atualizado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1000)
            }
        }
    }, [state.message, onSuccess])

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="id" value={cliente.id} />

            <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
                    <TabsTrigger value="observacoes">Observações</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4 mt-4" forceMount={true}>
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome *</Label>
                        <Input name="nome" id="nome" required defaultValue={cliente.nome} />
                        {state.errors?.nome && (
                            <p className="text-sm text-red-500 font-medium">{state.errors.nome}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label>
                        <IMaskInput
                            mask="(00) 00000-0000"
                            name="telefone"
                            id="telefone"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={cliente.telefone}
                        />
                        {state.errors?.telefone && (
                            <p className="text-sm text-red-500 font-medium">{state.errors.telefone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <IMaskInput
                            mask="000.000.000-00"
                            name="cpf"
                            id="cpf"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={cliente.cpf || ''}
                        />
                        {state.errors?.cpf && (
                            <p className="text-sm text-red-500 font-medium">{state.errors.cpf}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" id="email" type="email" defaultValue={cliente.email || ''} />
                        {state.errors?.email && (
                            <p className="text-sm text-red-500 font-medium">{state.errors.email}</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="observacoes" className="space-y-4 mt-4" forceMount={true}>
                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            name="observacoes"
                            id="observacoes"
                            defaultValue={cliente.observacoes || ''}
                            className="min-h-[300px]"
                        />
                        {state.errors?.observacoes && (
                            <p className="text-sm text-red-500 font-medium">{state.errors.observacoes}</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <SubmitButton submitText="Salvar Alterações" />

            {state.message && (
                <p className={`text-sm font-medium mt-2 ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}
