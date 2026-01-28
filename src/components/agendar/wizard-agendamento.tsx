"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { ArrowLeft, Check, Clock, User, Scissors, CalendarDays, Loader2 } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { criarAgendamentoCliente } from "@/actions/agendamento-cliente"

interface Servico {
    id: string
    nome: string
    preco: number
    duracaoMin: number
}

interface Colaborador {
    id: string
    nome: string | null
    foto: string | null
    servicos: { id: string }[]
}

interface HorarioColaborador {
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
    colaboradorId: string
}

interface HorarioFuncionamento {
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
}

interface Agendamento {
    data: Date
    colaboradorId: string | null
    agendamento_itens: {
        duracao: number
    }[]
}

interface WizardAgendamentoProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    empresaId: string
    empresaNome: string
    servicos: Servico[]
    colaboradores: Colaborador[]
    horariosColaborador: HorarioColaborador[]
    horariosFuncionamento: HorarioFuncionamento[]
    agendamentosExistentes: Agendamento[]
    clienteId?: string // Will be used when real auth is implemented
}

type Step = 0 | 1 | 2 | 3 | 4

const STEP_TITLES: Record<Step, string> = {
    0: "Seus dados",
    1: "Escolha o serviço",
    2: "Escolha o profissional",
    3: "Escolha data e horário",
    4: "Confirmar agendamento",
}

export function WizardAgendamento({
    open,
    onOpenChange,
    empresaId,
    empresaNome,
    servicos,
    colaboradores,
    horariosColaborador,
    horariosFuncionamento,
    agendamentosExistentes,
    clienteId,
}: WizardAgendamentoProps) {
    const [step, setStep] = useState<Step>(0)
    const [selectedServico, setSelectedServico] = useState<Servico | null>(null)
    const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // Client data for visitor mode
    const [clienteNome, setClienteNome] = useState("")
    const [clienteCpf, setClienteCpf] = useState("")
    const [clienteTelefone, setClienteTelefone] = useState("")
    const [clienteEmail, setClienteEmail] = useState("")

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(0)
                setSelectedServico(null)
                setSelectedColaborador(null)
                setSelectedDate(undefined)
                setSelectedTime(null)
                setSubmitError(null)
                setSubmitSuccess(false)
                setClienteNome("")
                setClienteCpf("")
                setClienteTelefone("")
                setClienteEmail("")
            }, 300)
        }
    }, [open])

    // Filter professionals who can perform the selected service
    const filteredColaboradores = selectedServico
        ? colaboradores.filter((c) =>
            c.servicos.some((s) => s.id === selectedServico.id)
        )
        : []

    // Get available time slots for the selected date and professional
    const getAvailableTimeSlots = (): string[] => {
        if (!selectedDate || !selectedColaborador || !selectedServico) return []

        const dayOfWeek = selectedDate.getDay()
        const serviceDuration = selectedServico.duracaoMin

        // Get professional's hours for this day (or null if not configured)
        const profHours = horariosColaborador.find(
            (h) => h.colaboradorId === selectedColaborador.id && h.diaSemana === dayOfWeek
        )

        // Get company's hours for this day
        const companyHours = horariosFuncionamento.find(
            (h) => h.diaSemana === dayOfWeek
        )

        // If company is closed, no slots
        if (!companyHours?.aberto) return []

        // If professional has hours configured and is closed, no slots
        if (profHours && !profHours.aberto) return []

        // Use professional hours if available, otherwise use company hours
        const startTime = profHours?.horaAbertura || companyHours.horaAbertura || "09:00"
        const endTime = profHours?.horaFechamento || companyHours.horaFechamento || "18:00"

        // Generate slots every 30 minutes
        const slots: string[] = []
        const [startHour, startMin] = startTime.split(":").map(Number)
        const [endHour, endMin] = endTime.split(":").map(Number)

        let currentHour = startHour
        let currentMin = startMin

        while (
            currentHour < endHour ||
            (currentHour === endHour && currentMin + serviceDuration <= endMin)
        ) {
            const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`

            // Check if this slot conflicts with existing appointments
            const slotStart = new Date(selectedDate)
            slotStart.setHours(currentHour, currentMin, 0, 0)
            const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000)

            const hasConflict = agendamentosExistentes.some((agendamento) => {
                if (agendamento.colaboradorId !== selectedColaborador.id) return false

                const agendamentoDate = new Date(agendamento.data)

                // Check if same day
                if (
                    agendamentoDate.getFullYear() !== selectedDate.getFullYear() ||
                    agendamentoDate.getMonth() !== selectedDate.getMonth() ||
                    agendamentoDate.getDate() !== selectedDate.getDate()
                ) {
                    return false
                }

                const totalDuration = agendamento.agendamento_itens.reduce(
                    (sum, item) => sum + item.duracao,
                    0
                ) || 30

                const agendamentoEnd = new Date(
                    agendamentoDate.getTime() + totalDuration * 60 * 1000
                )

                // Check overlap
                return slotStart < agendamentoEnd && slotEnd > agendamentoDate
            })

            // Only add slot if no conflict and it's in the future
            const now = new Date()
            if (!hasConflict && slotStart > now) {
                slots.push(timeString)
            }

            // Increment by 30 minutes
            currentMin += 30
            if (currentMin >= 60) {
                currentMin = 0
                currentHour += 1
            }
        }

        return slots
    }

    const availableTimeSlots = getAvailableTimeSlots()

    // Check if a date has available slots
    const isDateAvailable = (date: Date): boolean => {
        const dayOfWeek = date.getDay()

        // Get professional's hours (may not be configured)
        const profHours = horariosColaborador.find(
            (h) => h.colaboradorId === selectedColaborador?.id && h.diaSemana === dayOfWeek
        )

        // Get company's hours
        const companyHours = horariosFuncionamento.find(
            (h) => h.diaSemana === dayOfWeek
        )

        // If company is closed, date is not available
        if (!companyHours?.aberto) return false

        // If professional has hours configured and is closed, date is not available
        if (profHours && !profHours.aberto) return false

        // Otherwise, it's available (use company hours as fallback)
        return true
    }

    const handleNext = () => {
        if (step < 4) setStep((step + 1) as Step)
    }

    const handleBack = () => {
        if (step > 0) setStep((step - 1) as Step)
    }

    const handleConfirm = async () => {
        if (!selectedServico || !selectedColaborador || !selectedDate || !selectedTime) {
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const [hours, minutes] = selectedTime.split(":").map(Number)
            const dataAgendamento = new Date(selectedDate)
            dataAgendamento.setHours(hours, minutes, 0, 0)

            const result = await criarAgendamentoCliente({
                empresaId,
                colaboradorId: selectedColaborador.id,
                servicoId: selectedServico.id,
                data: dataAgendamento,
                preco: selectedServico.preco,
                duracao: selectedServico.duracaoMin,
                clienteId,
                clienteNome: clienteNome || undefined,
                clienteCpf: clienteCpf || undefined,
                clienteTelefone: clienteTelefone || undefined,
                clienteEmail: clienteEmail || undefined,
            })

            if (result.success) {
                setSubmitSuccess(true)
                setTimeout(() => {
                    onOpenChange(false)
                }, 2000)
            } else {
                setSubmitError(result.error || "Erro ao criar agendamento")
            }
        } catch (error) {
            setSubmitError("Erro ao criar agendamento. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        {step > 0 && !submitSuccess && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <DialogTitle>{STEP_TITLES[step]}</DialogTitle>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex gap-2 mt-4">
                        {[0, 1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#0070BA]" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    {/* Step 0: Client Data */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nome completo *</label>
                                <input
                                    type="text"
                                    value={clienteNome}
                                    onChange={(e) => setClienteNome(e.target.value)}
                                    placeholder="Seu nome completo"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">CPF</label>
                                <input
                                    type="text"
                                    value={clienteCpf}
                                    onChange={(e) => setClienteCpf(e.target.value)}
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Telefone *</label>
                                <input
                                    type="tel"
                                    value={clienteTelefone}
                                    onChange={(e) => setClienteTelefone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">E-mail</label>
                                <input
                                    type="email"
                                    value={clienteEmail}
                                    onChange={(e) => setClienteEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA] outline-none transition"
                                />
                            </div>
                            <Button
                                className="w-full h-12 bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold text-base mt-4"
                                onClick={handleNext}
                                disabled={!clienteNome.trim() || !clienteTelefone.trim()}
                            >
                                Continuar
                            </Button>
                        </div>
                    )}

                    {/* Step 1: Service Selection */}
                    {step === 1 && (
                        <div className="space-y-3">
                            {servicos.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    Nenhum serviço disponível
                                </p>
                            ) : (
                                servicos.map((servico) => (
                                    <button
                                        key={servico.id}
                                        onClick={() => {
                                            setSelectedServico(servico)
                                            setSelectedColaborador(null) // Reset professional when service changes
                                            handleNext()
                                        }}
                                        className={`w-full p-4 rounded-xl border text-left transition hover:border-[#0070BA] hover:bg-blue-50/50 ${selectedServico?.id === servico.id
                                            ? "border-[#0070BA] bg-blue-50"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Scissors className="h-5 w-5 text-[#0070BA]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {servico.nome}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{servico.duracaoMin} min</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatPrice(servico.preco)}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Step 2: Professional Selection */}
                    {step === 2 && (
                        <div className="space-y-3">
                            {filteredColaboradores.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">
                                        Nenhum profissional disponível para este serviço
                                    </p>
                                    <Button variant="outline" onClick={handleBack}>
                                        Escolher outro serviço
                                    </Button>
                                </div>
                            ) : (
                                filteredColaboradores.map((colaborador) => (
                                    <button
                                        key={colaborador.id}
                                        onClick={() => {
                                            setSelectedColaborador(colaborador)
                                            handleNext()
                                        }}
                                        className={`w-full p-4 rounded-xl border text-left transition hover:border-[#0070BA] hover:bg-blue-50/50 ${selectedColaborador?.id === colaborador.id
                                            ? "border-[#0070BA] bg-blue-50"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-100">
                                                {colaborador.foto ? (
                                                    <Image
                                                        src={colaborador.foto}
                                                        alt={colaborador.nome || "Profissional"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <User className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {colaborador.nome || "Profissional"}
                                                </h4>
                                                <p className="text-sm text-gray-500">Profissional</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Step 3: Date & Time Selection */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date)
                                        setSelectedTime(null)
                                    }}
                                    disabled={(date) => {
                                        const today = new Date()
                                        today.setHours(0, 0, 0, 0)
                                        return date < today || !isDateAvailable(date)
                                    }}
                                    locale={ptBR}
                                    className="rounded-md border"
                                />
                            </div>

                            {selectedDate && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        Horários disponíveis para{" "}
                                        {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                    </h4>
                                    {availableTimeSlots.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">
                                            Nenhum horário disponível nesta data
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableTimeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => {
                                                        setSelectedTime(time)
                                                        handleNext()
                                                    }}
                                                    className={`p-2 rounded-lg border text-center transition hover:border-[#0070BA] hover:bg-blue-50 ${selectedTime === time
                                                        ? "border-[#0070BA] bg-blue-50 font-semibold"
                                                        : "border-gray-200"
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="space-y-6">
                            {submitSuccess ? (
                                <div className="text-center py-8">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Agendamento confirmado!
                                    </h3>
                                    <p className="text-gray-500">
                                        Você receberá uma confirmação em breve.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Scissors className="h-5 w-5 text-[#0070BA]" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Serviço</p>
                                                <p className="font-semibold">{selectedServico?.nome}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                                {selectedColaborador?.foto ? (
                                                    <Image
                                                        src={selectedColaborador.foto}
                                                        alt={selectedColaborador.nome || ""}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Profissional</p>
                                                <p className="font-semibold">
                                                    {selectedColaborador?.nome}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <CalendarDays className="h-5 w-5 text-[#0070BA]" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Data e horário</p>
                                                <p className="font-semibold">
                                                    {selectedDate &&
                                                        format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                                                            locale: ptBR,
                                                        })}{" "}
                                                    às {selectedTime}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-[#0070BA]" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Duração</p>
                                                <p className="font-semibold">
                                                    {selectedServico?.duracaoMin} minutos
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                        <span className="text-gray-700">Total</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {selectedServico && formatPrice(selectedServico.preco)}
                                        </span>
                                    </div>

                                    {submitError && (
                                        <p className="text-sm text-red-500 text-center">
                                            {submitError}
                                        </p>
                                    )}

                                    <Button
                                        className="w-full h-12 bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold text-base"
                                        onClick={handleConfirm}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Confirmando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-5 w-5" />
                                                Confirmar agendamento
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
