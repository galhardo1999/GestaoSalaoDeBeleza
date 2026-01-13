"use client"

import * as React from "react"
import { startTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DateScrollPickerProps {
    selectedDate: Date
}

export function DateScrollPicker({ selectedDate }: DateScrollPickerProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State to track the visible range of dates. 
    // We'll center the view on the selected date initially.
    const [viewDate, setViewDate] = React.useState(selectedDate)

    // Generate a range of dates to display (e.g., 7 days centered on viewDate)
    const days = React.useMemo(() => {
        const dates = []
        // Show 3 days before and 3 days after viewDate (7 days total visible)
        for (let i = -3; i <= 3; i++) {
            dates.push(addDays(viewDate, i))
        }
        return dates
    }, [viewDate])

    const handleDateClick = (date: Date) => {
        const params = new URLSearchParams(searchParams)
        params.set("date", format(date, "yyyy-MM-dd"))
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    const handlePrev = () => {
        setViewDate(prev => subDays(prev, 1))
    }

    const handleNext = () => {
        setViewDate(prev => addDays(prev, 1))
    }

    // Update viewDate if selectedDate changes externally (e.g. from another picker)
    React.useEffect(() => {
        setViewDate(selectedDate)
    }, [selectedDate])

    return (
        <div className="flex flex-col items-center space-y-4 w-full select-none mb-6">
            <h3 className="text-xl font-semibold text-slate-900 capitalize">
                {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>

            <div className="flex items-center w-full justify-between gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900"
                    onClick={handlePrev}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex-1 flex justify-center gap-2 sm:gap-4 overflow-hidden">
                    {days.map((date) => {
                        const isSelected = isSameDay(date, selectedDate)
                        const isToday = isSameDay(date, new Date())

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleDateClick(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl transition-all duration-200 border-2",
                                    isSelected
                                        ? "bg-blue-50/30 border-blue-500 text-blue-600 shadow-sm"
                                        : "hover:bg-gray-50 text-gray-400 border-transparent hover:text-gray-600"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase mb-1 tracking-wider",
                                    isSelected ? "text-blue-500" : "text-gray-400"
                                )}>
                                    {format(date, "EEEE", { locale: ptBR }).replace('-feira', '')}
                                </span>
                                <span className={cn(
                                    "text-xl font-bold",
                                    isSelected ? "text-blue-600" : "text-gray-900"
                                )}>
                                    {format(date, "dd")}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900"
                    onClick={handleNext}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
