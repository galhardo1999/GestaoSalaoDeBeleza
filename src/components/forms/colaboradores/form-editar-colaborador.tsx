'use client'

import { useActionState, useEffect, useState } from 'react'
import { editarColaborador, updateHorariosColaborador } from '@/actions/colaboradores'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCPF } from '@/lib/utils'
import { SubmitButton } from '@/components/common/submit-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

const initialState = {
    message: '',
    errors: {} as {
        nome?: string[]
        email?: string[]
        senha?: string[]
        _form?: string[]
    }
}

const DIAS_SEMANA = [
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
]

export function FormEditarColaborador({ collaborator, onSuccess, servicos = [] }: { collaborator: any, onSuccess?: () => void, servicos?: any[] }) {
    // State for Main Form
    const [state, dispatch] = useActionState(editarColaborador, initialState)
    const [isSuccess, setIsSuccess] = useState(false)
    const [fotoBase64, setFotoBase64] = useState(collaborator.foto || '')
    const [cpfValue, setCpfValue] = useState(formatCPF(collaborator.cpf) || '')

    // State for Horarios
    const [horarios, setHorarios] = useState<any[]>(() => {
        // Normalize initial hours
        return DIAS_SEMANA.map(day => {
            const found = collaborator.horarios?.find((h: any) => h.diaSemana === day.value)
            return found ? { ...found } : {
                diaSemana: day.value,
                aberto: true,
                horaAbertura: "09:00",
                horaFechamento: "18:00"
            }
        })
    })
    const [horariosPending, setHorariosPending] = useState(false)

    // Handlers for Main Form
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11)
        setCpfValue(formatCPF(value))
    }

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
        if (state.message === 'Colaborador atualizado com sucesso!') {
            setIsSuccess(true)
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1000)
            }
        }
    }, [state.message, onSuccess])

    const hasService = (serviceId: string) => {
        return collaborator.servicos?.some((s: any) => s.id === serviceId)
    }

    // Handlers for Horarios
    const handleHorarioToggle = (diaSemana: number, aberto: boolean) => {
        setHorarios(prev => prev.map(h =>
            h.diaSemana === diaSemana ? { ...h, aberto } : h
        ))
    }

    const handleHorarioTimeChange = (diaSemana: number, field: 'horaAbertura' | 'horaFechamento', value: string) => {
        setHorarios(prev => prev.map(h =>
            h.diaSemana === diaSemana ? { ...h, [field]: value } : h
        ))
    }

    const handleSaveHorarios = async () => {
        setHorariosPending(true)
        try {
            const result = await updateHorariosColaborador(collaborator.id, horarios)
            if (result.success) {
                alert("Horários atualizados com sucesso!")
            } else {
                alert("Erro ao salvar horários: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Erro inesperado.")
        } finally {
            setHorariosPending(false)
        }
    }

    return (
        <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="dados">Dados & Acesso</TabsTrigger>
                <TabsTrigger value="horarios">Horário de Expediente</TabsTrigger>
            </TabsList>

            <TabsContent value="dados">
                <form action={dispatch} className="space-y-4">
                    <input type="hidden" name="id" value={collaborator.id} />

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="foto">Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            {fotoBase64 && (
                                <img
                                    src={fotoBase64}
                                    alt="Current"
                                    className="h-10 w-10 rounded-full object-cover border"
                                />
                            )}
                            <Input
                                id="foto"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="flex-1"
                            />
                        </div>
                        <input type="hidden" name="foto" value={fotoBase64} />
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <h3 className="text-sm font-medium mb-3">Acesso de Login</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cpf">Login (CPF)</Label>
                                <Input
                                    name="cpf"
                                    id="cpf"
                                    value={cpfValue}
                                    onChange={handleCpfChange}
                                    placeholder="000.000.000-00"
                                />
                                <p className="text-xs text-muted-foreground">O CPF é usado para realizar login.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha</Label>
                                <Input
                                    name="senha"
                                    id="senha"
                                    type="password"
                                    placeholder="Nova senha (opcional)"
                                />
                                <p className="text-xs text-muted-foreground">Preencha apenas para alterar.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <h3 className="text-sm font-medium mb-3">Comissão e Serviços</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label htmlFor="comissaoTipo">Tipo de Comissão</Label>
                                <select
                                    name="comissaoTipo"
                                    id="comissaoTipo"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    defaultValue={collaborator.comissaoTipo || 'PORCENTAGEM'}
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
                                    defaultValue={collaborator.comissaoValor || ''}
                                    placeholder="Ex: 10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Serviços Realizados</Label>
                            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto bg-muted/20">
                                {servicos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhum serviço disponível.</p>
                                ) : (
                                    servicos.map(servico => (
                                        <div key={servico.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="servicos"
                                                value={servico.id}
                                                defaultChecked={hasService(servico.id)}
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
                    </div>

                    <SubmitButton submitText="Salvar Dados" className="w-full mt-4" />

                    {state.message && (
                        <p className={`text-sm font-medium mt-2 text-center ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </p>
                    )}
                </form>
            </TabsContent>

            <TabsContent value="horarios">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Define os dias e horários que este colaborador atende.
                    </p>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {horarios.map((horario) => {
                            const diaInfo = DIAS_SEMANA.find(d => d.value === horario.diaSemana)
                            return (
                                <div
                                    key={horario.diaSemana}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                                >
                                    <div className="w-32 shrink-0">
                                        <span className="font-medium text-sm">
                                            {diaInfo?.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={horario.aberto}
                                            onCheckedChange={(checked) => handleHorarioToggle(horario.diaSemana, checked)}
                                        />
                                        <span className={`text-xs w-14 ${horario.aberto ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {horario.aberto ? 'Aberto' : 'Fechado'}
                                        </span>
                                    </div>

                                    {horario.aberto && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Input
                                                type="time"
                                                value={horario.horaAbertura || "09:00"}
                                                onChange={(e) => handleHorarioTimeChange(horario.diaSemana, 'horaAbertura', e.target.value)}
                                                className="w-24 h-8 text-sm"
                                            />
                                            <span className="text-muted-foreground text-xs">até</span>
                                            <Input
                                                type="time"
                                                value={horario.horaFechamento || "18:00"}
                                                onChange={(e) => handleHorarioTimeChange(horario.diaSemana, 'horaFechamento', e.target.value)}
                                                className="w-24 h-8 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="pt-4 border-t sticky bottom-0 bg-background">
                        <Button
                            onClick={handleSaveHorarios}
                            disabled={horariosPending}
                            className="w-full"
                        >
                            {horariosPending ? "Salvando..." : "Salvar Horários"}
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}
