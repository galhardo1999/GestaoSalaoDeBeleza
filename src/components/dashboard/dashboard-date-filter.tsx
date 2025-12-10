"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardDateFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentPeriod = searchParams.get("period") || "today"

    const setPeriod = (period: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("period", period)
        router.push(`${pathname}?${params.toString()}`)
    }

    const labels = {
        today: "Hoje",
        week: "Semana",
        month: "Mês",
    }

    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="sm" className="h-8 gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {labels[currentPeriod as keyof typeof labels] || "Hoje"}
                </span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        {labels[currentPeriod as keyof typeof labels] || "Hoje"}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPeriod("today")}>
                    Hoje
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("week")}>
                    Semana
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod("month")}>
                    Mês
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
