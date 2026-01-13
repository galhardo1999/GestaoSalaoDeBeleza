"use client"

import { useState, useEffect, startTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getMonthlyAppointmentCounts } from "@/actions/dashboard"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function DashboardCalendar() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const dateParam = searchParams.get("date")
    // Initialize selectedDate from URL or default to today
    const [selectedDate, setSelectedDate] = useState(() => {
        if (dateParam) {
            const [y, m, d] = dateParam.split('-').map(Number)
            return new Date(y, m - 1, d)
        }
        return new Date()
    })

    const [currentDate, setCurrentDate] = useState(new Date(selectedDate)) // Start calendar view at selected date
    const [eventsData, setEventsData] = useState<Record<string, number>>({})

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Sync state with URL date param
    useEffect(() => {
        if (dateParam) {
            const [y, m, d] = dateParam.split('-').map(Number)
            const newDate = new Date(y, m - 1, d)
            setSelectedDate(newDate)
            // Optional: only change view if the month is different? 
            // Better to change view to ensure the selected date is visible.
            setCurrentDate(newDate)
        }
    }, [dateParam])

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const counts = await getMonthlyAppointmentCounts(year, month)
                setEventsData(counts)
            } catch (error) {
                console.error("Failed to fetch calendar counts:", error)
            }
        }
        fetchCounts()
    }, [year, month])

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const getDayKey = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    const isToday = (day: number) => {
        const today = new Date()
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        )
    }

    const isSelected = (day: number) => {
        return (
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear()
        )
    }

    const days = []

    // Células vazias para dias antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = getDayKey(day)
        const eventCount = eventsData[dayKey] || 0
        const hasEvents = eventCount > 0

        days.push(
            <button
                key={day}
                onClick={() => {
                    const newDate = new Date(year, month, day)
                    setSelectedDate(newDate)
                    // Update URL
                    const params = new URLSearchParams(searchParams)
                    // Format YYYY-MM-DD manually to avoid timezone issues
                    const dateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`
                    params.set("date", dateStr)
                    startTransition(() => {
                        router.push(`${pathname}?${params.toString()}`)
                    })
                }}
                className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
                    isSelected(day)
                        ? "bg-slate-900 text-white shadow-md"
                        : isToday(day)
                            ? "bg-pink-50 text-pink-600 font-semibold" // Aproximando 'rose-light'
                            : "text-gray-900 hover:bg-gray-100"
                )}
            >
                {day}
                {hasEvents && !isSelected(day) && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-slate-900" />
                )}
            </button>
        )
    }

    return (
        <Card className="bg-white">
            <CardContent className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between px-2">
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">
                        {MONTHS[month]} {year}
                    </h2>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevMonth}
                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextMonth}
                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days of week */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="flex h-10 items-center justify-center text-xs font-medium text-gray-400 capitalize"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">{days}</div>

                {/* Selected date info */}
                <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                    <p className="text-lg font-semibold text-gray-900 capitalize" suppressHydrationWarning>
                        {selectedDate.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {eventsData[getDayKey(selectedDate.getDate())] || 0} agendamentos
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
