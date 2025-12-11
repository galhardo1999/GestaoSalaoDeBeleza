"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
// @ts-ignore
import { NovoAgendamentoDialog } from "@/components/forms/agendamentos/novo-agendamento-dialog"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
} from "date-fns"
import { ptBR } from "date-fns/locale"

// Interfaces based on Prisma Schema + View needs
type ViewMode = "month" | "week"

export interface CalendarAppointment {
    id: string
    data: Date
    status: string
    cliente: {
        nome: string
    }
    servico: {
        nome: string
        duracaoMin: number
    }
    colaborador?: {
        nome: string
    } | null
}

interface CalendarViewProps {
    agendamentos: CalendarAppointment[]
    clientes: any[]
    servicos: any[]
    colaboradores: any[]
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00 - 19:00

export function CalendarView({ agendamentos, clientes, servicos, colaboradores }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>("month")

    const navigatePrev = () => {
        if (viewMode === "month") {
            setCurrentDate(subMonths(currentDate, 1))
        } else {
            setCurrentDate(subWeeks(currentDate, 1))
        }
    }

    const navigateNext = () => {
        if (viewMode === "month") {
            setCurrentDate(addMonths(currentDate, 1))
        } else {
            setCurrentDate(addWeeks(currentDate, 1))
        }
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    const getAppointmentsForDate = (date: Date) => {
        return agendamentos
            .filter((apt) => isSameDay(new Date(apt.data), date) && apt.status !== 'CANCELADO')
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    }

    // Month view calendar days
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { locale: ptBR })
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR })
    const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    // Week view days
    const weekStart = startOfWeek(currentDate, { locale: ptBR })
    const weekEnd = endOfWeek(currentDate, { locale: ptBR })
    const weekDaysArray = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Helper to colorize appointments based on something (e.g., service or status)
    // For now, consistent color or random based on ID char
    const getAppointmentColor = (status: string) => {
        switch (status) {
            case 'AGENDADO': return 'bg-emerald-500'
            case 'CONCLUIDO': return 'bg-teal-500'
            case 'CANCELADO': return 'bg-red-500'
            default: return 'bg-slate-500'
        }
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 font-serif">Calendário</h1>
                    <p className="text-sm text-muted-foreground">Gerencie sua agenda de atendimentos</p>
                </div>
                <NovoAgendamentoDialog clientes={clientes} servicos={servicos} colaboradores={colaboradores} />
            </div>

            {/* Calendar Card */}
            <Card className="shadow-sm border-border flex-1 flex flex-col">
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="rounded-lg" onClick={navigatePrev}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg" onClick={navigateNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <CardTitle className="ml-2 text-xl capitalize font-serif font-medium">
                                {viewMode === "month"
                                    ? format(currentDate, "MMMM yyyy", { locale: ptBR })
                                    : `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(weekEnd, "dd MMM yyyy", { locale: ptBR })}`}
                            </CardTitle>
                        </div>

                        {/* View Toggle & Today */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="rounded-lg" onClick={goToToday}>
                                Hoje
                            </Button>
                            <div className="flex rounded-lg border border-border bg-muted p-1">
                                <Button
                                    variant={viewMode === "month" ? "default" : "ghost"}
                                    size="sm"
                                    className="rounded-md px-4"
                                    onClick={() => setViewMode("month")}
                                >
                                    Mês
                                </Button>
                                <Button
                                    variant={viewMode === "week" ? "default" : "ghost"}
                                    size="sm"
                                    className="rounded-md px-4"
                                    onClick={() => setViewMode("week")}
                                >
                                    Semana
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-auto">
                    {viewMode === "month" ? (
                        /* Month View */
                        <div className="p-4 h-full flex flex-col">
                            {/* Week day headers */}
                            <div className="mb-2 grid grid-cols-7 gap-1">
                                {WEEK_DAYS.map((day) => (
                                    <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
                                {monthDays.map((day) => {
                                    const dayAppointments = getAppointmentsForDate(day)
                                    const isTodayVal = isSameDay(day, new Date())
                                    const isCurrentMonth = isSameMonth(day, currentDate)
                                    const isSelected = isSameDay(day, selectedDate)

                                    return (
                                        <button
                                            key={day.toString()}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "group relative min-h-[100px] flex flex-col items-start justify-start rounded-lg border p-2 text-left transition-all hover:border-primary/50 hover:bg-muted/50",
                                                isCurrentMonth ? "border-border bg-card" : "border-transparent bg-muted/30",
                                                isSelected && "border-primary bg-primary/5",
                                                isTodayVal && "ring-2 ring-primary ring-offset-2"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium mb-1",
                                                    isTodayVal && "bg-primary text-primary-foreground",
                                                    !isTodayVal && isCurrentMonth && "text-foreground",
                                                    !isTodayVal && !isCurrentMonth && "text-muted-foreground"
                                                )}
                                            >
                                                {format(day, "d")}
                                            </span>

                                            {/* Appointments preview */}
                                            <div className="w-full space-y-1">
                                                {dayAppointments.slice(0, 3).map((apt) => (
                                                    <div
                                                        key={apt.id}
                                                        className={cn("truncate rounded px-1.5 py-0.5 text-[10px] text-white w-full text-left", getAppointmentColor(apt.status))}
                                                    >
                                                        {format(new Date(apt.data), "HH:mm")} {apt.cliente.nome.split(' ')[0]}
                                                    </div>
                                                ))}
                                                {dayAppointments.length > 3 && (
                                                    <div className="text-[10px] text-muted-foreground pl-1">+{dayAppointments.length - 3} mais</div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Week View */
                        <div className="overflow-auto h-full">
                            <div className="min-w-[800px]">
                                {/* Week day headers */}
                                <div className="sticky top-0 z-10 grid grid-cols-8 border-b border-border bg-card">
                                    <div className="border-r border-border p-3"></div>
                                    {weekDaysArray.map((day) => {
                                        const isTodayVal = isSameDay(day, new Date())
                                        return (
                                            <div
                                                key={day.toString()}
                                                className={cn(
                                                    "border-r border-border p-3 text-center last:border-r-0",
                                                    isTodayVal && "bg-primary/5"
                                                )}
                                            >
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    {format(day, "EEE", { locale: ptBR })}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold",
                                                        isTodayVal && "bg-primary text-primary-foreground"
                                                    )}
                                                >
                                                    {format(day, "d")}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Time slots */}
                                <div className="relative">
                                    {HOURS.map((hour) => (
                                        <div key={hour} className="grid grid-cols-8 border-b border-border h-20">
                                            <div className="border-r border-border p-2 text-right text-sm text-muted-foreground sticky left-0 bg-card z-0">
                                                {String(hour).padStart(2, "0")}:00
                                            </div>
                                            {weekDaysArray.map((day) => {
                                                const dayAppointments = getAppointmentsForDate(day).filter((apt) => {
                                                    const aptHour = new Date(apt.data).getHours()
                                                    return aptHour === hour
                                                })

                                                return (
                                                    <div
                                                        key={day.toString()}
                                                        className="relative border-r border-border p-1 last:border-r-0 hover:bg-muted/30 transition-colors"
                                                    >
                                                        {dayAppointments.map((apt) => (
                                                            <div
                                                                key={apt.id}
                                                                className={cn(
                                                                    "mb-1 rounded-md p-1.5 text-xs text-white shadow-sm cursor-pointer hover:opacity-90",
                                                                    getAppointmentColor(apt.status)
                                                                )}
                                                            >
                                                                <div className="font-medium">{format(new Date(apt.data), "HH:mm")}</div>
                                                                <div className="truncate font-semibold">{apt.servico.nome}</div>
                                                                <div className="truncate opacity-90">{apt.cliente.nome}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected Date Details */}
            <Card className="shadow-sm border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-medium font-serif">
                        Agendamentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {getAppointmentsForDate(selectedDate).length > 0 ? (
                        <div className="space-y-3">
                            {getAppointmentsForDate(selectedDate).map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-colors hover:bg-gray-50 hover:shadow-sm"
                                >
                                    <div className={cn("h-12 w-1 rounded-full", getAppointmentColor(apt.status))} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{apt.servico.nome}</span>
                                            <span className="text-sm text-muted-foreground">• {apt.servico.duracaoMin} min</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-0.5">
                                            {apt.cliente.nome} • com {apt.colaborador?.nome || "Sem colaborador"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900">{format(new Date(apt.data), "HH:mm")}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{apt.status.toLowerCase()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                            Nenhum agendamento para esta data
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
