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

export function YearFilter({ currentYear }: { currentYear: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Generate range of years (e.g., current year - 5 to current year + 2)
    const thisYear = new Date().getFullYear()
    const years = Array.from({ length: 8 }, (_, i) => thisYear - 5 + i).reverse()

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("year", value)
        router.push(`?${params.toString()}`)
    }

    return (
        <Select defaultValue={currentYear.toString()} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
