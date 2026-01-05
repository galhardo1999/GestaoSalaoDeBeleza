"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function MonthFilter({ currentMonth }: { currentMonth: number }) {
    const router = useRouter()

    const searchParams = useSearchParams()

    const handleValueChange = (value: string) => {
        const monthIndex = parseInt(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set("month", monthIndex.toString())
        router.push(`?${params.toString()}`)
    }

    return (
        <Select defaultValue={currentMonth.toString()} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
                {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                        {month}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
