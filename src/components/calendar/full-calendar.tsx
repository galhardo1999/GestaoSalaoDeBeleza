'use client'

import { useState } from 'react'
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    addWeeks,
    subWeeks,
    isSameDay,
    isToday,
    differenceInMinutes,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    isSameMonth
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Agendamento {
    id: string
    data: Date
    cliente: { nome: string }
    servico: { nome: string; duracaoMin: number; preco: any }
    status: string
}

interface FullCalendarProps {
    agendamentos: Agendamento[]
}

type CalendarView = 'month' | 'week'

export function FullCalendar({ agendamentos }: FullCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<CalendarView>('week')

    const getAppointmentsForDay = (day: Date) => {
        return agendamentos
            .filter(a => isSameDay(new Date(a.data), day) && a.status !== 'CANCELADO')
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    }

    // --- Navigation Logic ---
    const next = () => {
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
        else setCurrentDate(addMonths(currentDate, 1))
    }

    const prev = () => {
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
        else setCurrentDate(subMonths(currentDate, 1))
    }

    const goToToday = () => setCurrentDate(new Date())

    // --- Header Title ---
    const getHeaderTitle = () => {
        if (view === 'week') {
            const start = startOfWeek(currentDate, { locale: ptBR })
            const end = endOfWeek(currentDate, { locale: ptBR })
            return `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM yyyy', { locale: ptBR })}`
        }
        return format(currentDate, 'MMMM yyyy', { locale: ptBR })
    }

    // --- Renderers ---

    const renderWeekView = () => {
        const startDate = startOfWeek(currentDate, { locale: ptBR })
        const endDate = endOfWeek(currentDate, { locale: ptBR })
        const days = eachDayOfInterval({ start: startDate, end: endDate })

        // Hours to display (07:00 to 22:00)
        const startHour = 7
        const endHour = 22
        const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour)

        const getPosition = (date: Date, duration: number) => {
            const aptDate = new Date(date)
            const dayStart = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate(), startHour, 0, 0)
            const minutesFromStart = differenceInMinutes(aptDate, dayStart)
            const top = (minutesFromStart / 60) * 60
            const height = (duration / 60) * 60
            return { top, height }
        }

        return (
            <div className="flex-1 border rounded-lg shadow-sm bg-white flex flex-col overflow-hidden">
                <div className="flex border-b bg-gray-50 flex-none ml-14">
                    {days.map(day => (
                        <div key={day.toString()} className={cn(
                            "flex-1 h-12 flex flex-col items-center justify-center text-sm border-r last:border-r-0",
                            isToday(day) ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 font-medium"
                        )}>
                            <span className="capitalize">{format(day, 'EEE', { locale: ptBR })}</span>
                            <span className="text-lg">{format(day, 'd', { locale: ptBR })}</span>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto relative flex">
                    <div className="w-14 flex-none border-r bg-gray-50 sticky left-0 z-10">
                        {hours.map(hour => (
                            <div key={hour} className="h-[60px] relative border-b border-transparent box-border">
                                <span className="absolute -top-[10px] right-2 text-xs text-gray-500 bg-gray-50 px-1">
                                    {hour}:00
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 flex relative min-w-[700px]">
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {hours.map(hour => (
                                <div key={`line-${hour}`} className="h-[60px] border-b border-gray-100 w-full"></div>
                            ))}
                        </div>
                        {days.map(day => (
                            <div key={day.toString()} className="flex-1 border-r last:border-r-0 relative group">
                                <div className="absolute inset-0 bg-transparent hover:bg-gray-50/50 pointer-events-none transition-colors"></div>
                                {getAppointmentsForDay(day).map(apt => {
                                    const { top, height } = getPosition(new Date(apt.data), apt.servico.duracaoMin)
                                    if (top < 0) return null;
                                    return (
                                        <div
                                            key={apt.id}
                                            className="absolute left-1 right-1 rounded border overflow-hidden text-xs transition-all hover:z-20 hover:shadow-lg bg-blue-100 border-blue-200 text-blue-700 cursor-pointer hover:!h-auto hover:min-h-fit group"
                                            style={{ top: `${top}px`, height: `${Math.max(25, height)}px` }}
                                            title={`${format(new Date(apt.data), 'HH:mm')} - ${apt.cliente.nome}`}
                                        >
                                            <div className="p-1 leading-tight h-full">
                                                <div className="font-semibold flex justify-between">
                                                    <span>{format(new Date(apt.data), 'HH:mm')}</span>
                                                </div>
                                                <div className="font-medium truncate mt-0.5">{apt.cliente.nome}</div>
                                                <div className="truncate opacity-75 text-[10px]">{apt.servico.nome}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderMonthView = () => {
        const monthStart = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
        const monthEnd = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

        return (
            <div className="flex-1 border rounded-lg shadow-sm bg-white flex flex-col">
                <div className="grid grid-cols-7 border-b">
                    {weekDays.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-semibold text-gray-500 border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {days.map((day) => {
                        const dayAppointments = getAppointmentsForDay(day)
                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[100px] p-2 border-b border-r last:border-r-0 relative group transition-colors",
                                    !isSameMonth(day, currentDate) && "bg-gray-50 text-gray-400",
                                    isToday(day) && "bg-blue-50/30"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                        "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                        isToday(day) ? "bg-blue-600 text-white" : "text-gray-700"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayAppointments.slice(0, 3).map(apt => (
                                        <div
                                            key={apt.id}
                                            className="text-xs p-1 rounded truncate border bg-blue-100 border-blue-200 text-blue-700"
                                            title={`${format(new Date(apt.data), 'HH:mm')} - ${apt.cliente.nome}`}
                                        >
                                            <span className="font-semibold mr-1">{format(new Date(apt.data), 'HH:mm')}</span>
                                            {apt.cliente.nome}
                                        </div>
                                    ))}
                                    {dayAppointments.length > 3 && (
                                        <div className="text-xs text-gray-500 font-medium pl-1">
                                            + {dayAppointments.length - 3} mais
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold capitalize w-64">
                        {getHeaderTitle()}
                    </h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={prev}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={next}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={goToToday}>
                            Hoje
                        </Button>
                    </div>
                </div>

                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    <Button
                        variant={view === 'week' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setView('week')}
                        className={cn("text-xs border-0", view === 'week' && "bg-white shadow-sm")}
                    >
                        <Clock className="w-3 h-3 mr-2" />
                        Semana
                    </Button>
                    <Button
                        variant={view === 'month' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setView('month')}
                        className={cn("text-xs border-0", view === 'month' && "bg-white shadow-sm")}
                    >
                        <CalendarIcon className="w-3 h-3 mr-2" />
                        Mês
                    </Button>
                </div>
            </div>

            {view === 'week' ? renderWeekView() : renderMonthView()}
        </div>
    )
}
