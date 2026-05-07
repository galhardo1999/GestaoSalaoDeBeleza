"use client"

import * as React from "react"
import { startTransition } from "react"
import { addDays, format, isSameDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DateScrollPickerProps = {
    selectedDate: Date
}

export function DateScrollPicker({ selectedDate }: DateScrollPickerProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [dataVisivel, setDataVisivel] = React.useState(selectedDate)

    const dias = React.useMemo(() => {
        const datas = []
        for (let indice = -3; indice <= 3; indice++) {
            datas.push(addDays(dataVisivel, indice))
        }
        return datas
    }, [dataVisivel])

    const selecionarData = (data: Date) => {
        const params = new URLSearchParams(searchParams)
        params.set("date", format(data, "yyyy-MM-dd"))
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    React.useEffect(() => {
        setDataVisivel(selectedDate)
    }, [selectedDate])

    return (
        <div className="mb-6 flex w-full select-none flex-col items-center space-y-4">
            <h3 className="text-center font-heading text-xl font-semibold capitalize text-[#F5F0E8]">
                {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>

            <div className="flex w-full items-center justify-between gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[7px] text-[#8C8379] hover:bg-[#1B1B1B] hover:text-[#D4AF37]"
                    onClick={() => setDataVisivel((dataAtual) => subDays(dataAtual, 1))}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex flex-1 justify-center gap-2 overflow-hidden sm:gap-3">
                    {dias.map((data) => {
                        const selecionada = isSameDay(data, selectedDate)

                        return (
                            <button
                                key={data.toISOString()}
                                onClick={() => selecionarData(data)}
                                className={cn(
                                    "flex h-20 min-w-[4.35rem] flex-col items-center justify-center rounded-[10px] border transition-colors duration-200",
                                    selecionada
                                        ? "border-[#D4AF37]/55 bg-[#D4AF37]/10 text-[#D4AF37]"
                                        : "border-transparent text-[#8C8379] hover:border-[#2A2418] hover:bg-[#151515] hover:text-[#F5F0E8]"
                                )}
                            >
                                <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                                    {format(data, "EEEE", { locale: ptBR }).replace("-feira", "")}
                                </span>
                                <span className={cn("font-heading text-2xl font-semibold", selecionada ? "text-[#D4AF37]" : "text-[#F5F0E8]")}>
                                    {format(data, "dd")}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[7px] text-[#8C8379] hover:bg-[#1B1B1B] hover:text-[#D4AF37]"
                    onClick={() => setDataVisivel((dataAtual) => addDays(dataAtual, 1))}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
