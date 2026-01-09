"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, setMonth, setYear, addYears, subYears } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function MonthPicker({ currentDate }: { currentDate: Date }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = React.useState(false)
    const [viewDate, setViewDate] = React.useState(currentDate)

    React.useEffect(() => {
        if (isOpen) {
            setViewDate(currentDate)
        }
    }, [isOpen, currentDate])

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = setMonth(setYear(currentDate, viewDate.getFullYear()), monthIndex)

        const params = new URLSearchParams()
        params.set('month', (newDate.getMonth() + 1).toString())
        params.set('year', newDate.getFullYear().toString())

        router.push(`/dashboard/financeiro?${params.toString()}`)
        setIsOpen(false)
    }

    const handleYearChange = (increment: number) => {
        setViewDate(prev => addYears(prev, increment))
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal bg-white",
                        !currentDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="capitalize">
                        {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
                <div className="space-y-4 p-3">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                            onClick={() => handleYearChange(-1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-semibold">
                            {viewDate.getFullYear()}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                            onClick={() => handleYearChange(1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((month, index) => (
                            <Button
                                key={month}
                                variant={
                                    currentDate.getMonth() === index &&
                                        currentDate.getFullYear() === viewDate.getFullYear()
                                        ? "default"
                                        : "ghost"
                                }
                                className={cn(
                                    "h-8 text-xs px-2",
                                    currentDate.getMonth() === index &&
                                    currentDate.getFullYear() === viewDate.getFullYear() &&
                                    "bg-black text-white hover:bg-black/90"
                                )}
                                onClick={() => handleMonthSelect(index)}
                            >
                                {month.substring(0, 3)}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
