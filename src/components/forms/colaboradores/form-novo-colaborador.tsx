'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { criarColaborador } from '@/actions/colaboradores'
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

export function FormNovoColaborador({ onSuccess, servicos = [] }: { onSuccess?: () => void, servicos?: any[] }) {
    const [state, dispatch] = useActionState(criarColaborador, initialState)
    const [isSuccess, setIsSuccess] = useState(false)
    const [fotoBase64, setFotoBase64] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFotoBase64(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        if (state.message === 'Colaborador cadastrado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
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
                <Input name="nome" id="nome" required placeholder="Ex: João Silva" />
                {state.errors?.nome && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.nome}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" required placeholder="joao@email.com" />
                {state.errors?.email && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input name="cpf" id="cpf" placeholder="000.000.000-00" />
                {/* Error handling for CPF if needed, though state.errors might need type update */}
            </div>

            <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input name="senha" id="senha" type="password" required placeholder="******" />
                {state.errors?.senha && (
                    <p className="text-sm text-red-500 font-medium">{state.errors.senha}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="foto">Foto</Label>
                <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <input type="hidden" name="foto" value={fotoBase64} />
                {fotoBase64 && (
                    <div className="mt-2 text-xs text-green-600">
                        Foto selecionada
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="comissaoTipo">Tipo de Comissão</Label>
                    <select
                        name="comissaoTipo"
                        id="comissaoTipo"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        defaultValue="PORCENTAGEM"
                    >
                        <option value="PORCENTAGEM">Porcentagem (%)</option>
                        <option value="VALOR_FIXO">Valor Fixo (R$)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comissaoValor">Valor da Comissão</Label>
                    <Input
                        name="comissaoValor"
                        id="comissaoValor"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 10"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Serviços Realizados *</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {servicos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
                    ) : (
                        servicos.map(servico => (
                            <div key={servico.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="servicos"
                                    value={servico.id}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label className="font-normal text-sm cursor-pointer">
                                    {servico.nome}
                                </Label>
                            </div>
                        ))
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
            {pending ? 'Salvando...' : 'Salvar Colaborador'}
        </Button>
    )
}
