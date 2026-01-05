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

const filters = [
    { value: "30", label: "Últimos 30 dias" },
    { value: "45", label: "Últimos 45 dias" },
    { value: "60", label: "Últimos 60 dias" },
    { value: "90", label: "Últimos 90 dias" },
]

export function DaysFilter({ currentDays }: { currentDays: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("days", value)
        // Remove 'date' if it exists to avoid confusion, though logic should prioritize 'days'
        params.delete("date")
        router.push(`?${params.toString()}`)
    }

    return (
        <Select defaultValue={currentDays.toString()} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
                {filters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
