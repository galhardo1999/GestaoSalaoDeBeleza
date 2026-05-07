"use client"

import { startTransition, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getMonthlyAppointmentCounts } from "@/actions/dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
]

export function DashboardCalendar() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const dateParam = searchParams.get("date")
    const [dataSelecionada, setDataSelecionada] = useState(() => {
        if (dateParam) {
            const [ano, mes, dia] = dateParam.split("-").map(Number)
            return new Date(ano, mes - 1, dia)
        }
        return new Date()
    })

    const [dataAtual, setDataAtual] = useState(new Date(dataSelecionada))
    const [eventosPorDia, setEventosPorDia] = useState<Record<string, number>>({})

    const ano = dataAtual.getFullYear()
    const mes = dataAtual.getMonth()

    const primeiroDiaDoMes = new Date(ano, mes, 1).getDay()
    const diasNoMes = new Date(ano, mes + 1, 0).getDate()

    useEffect(() => {
        if (dateParam) {
            const [anoSelecionado, mesSelecionado, diaSelecionado] = dateParam.split("-").map(Number)
            const novaData = new Date(anoSelecionado, mesSelecionado - 1, diaSelecionado)
            setDataSelecionada(novaData)
            setDataAtual(novaData)
        }
    }, [dateParam])

    useEffect(() => {
        const carregarContagens = async () => {
            try {
                const contagens = await getMonthlyAppointmentCounts(ano, mes)
                setEventosPorDia(contagens)
            } catch (erro) {
                console.error("Falha ao buscar contagens do calendário:", erro)
            }
        }

        carregarContagens()
    }, [ano, mes])

    const mesAnterior = () => {
        setDataAtual(new Date(ano, mes - 1, 1))
    }

    const proximoMes = () => {
        setDataAtual(new Date(ano, mes + 1, 1))
    }

    const obterChaveDia = (dia: number) => {
        return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    }

    const ehHoje = (dia: number) => {
        const hoje = new Date()
        return (
            dia === hoje.getDate() &&
            mes === hoje.getMonth() &&
            ano === hoje.getFullYear()
        )
    }

    const estaSelecionado = (dia: number) => {
        return (
            dia === dataSelecionada.getDate() &&
            mes === dataSelecionada.getMonth() &&
            ano === dataSelecionada.getFullYear()
        )
    }

    const dias = []

    for (let indice = 0; indice < primeiroDiaDoMes; indice++) {
        dias.push(<div key={`empty-${indice}`} className="h-10" />)
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const chaveDia = obterChaveDia(dia)
        const quantidadeEventos = eventosPorDia[chaveDia] || 0
        const temEventos = quantidadeEventos > 0

        dias.push(
            <button
                key={dia}
                onClick={() => {
                    const novaData = new Date(ano, mes, dia)
                    setDataSelecionada(novaData)
                    const params = new URLSearchParams(searchParams)
                    const dataUrl = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, "0")}-${String(novaData.getDate()).padStart(2, "0")}`
                    params.set("date", dataUrl)
                    startTransition(() => {
                        router.push(`${pathname}?${params.toString()}`)
                    })
                }}
                className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-[8px] text-sm font-semibold transition-colors duration-200",
                    estaSelecionado(dia)
                        ? "bg-dashboard-primary text-dashboard-primary-foreground shadow-[0_10px_24px_rgba(197,160,89,0.18)] dark:shadow-[0_10px_24px_rgba(212,175,55,0.18)]"
                        : ehHoje(dia)
                            ? "border border-dashboard-primary/35 bg-dashboard-primary/10 text-dashboard-primary"
                            : "text-dashboard-muted hover:bg-dashboard-surface-hover hover:text-dashboard-foreground"
                )}
            >
                {dia}
                {temEventos && !estaSelecionado(dia) && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-dashboard-primary" />
                )}
            </button>
        )
    }

    return (
        <Card className="rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <CardContent className="p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between px-2">
                    <h2 className="font-heading text-2xl font-semibold capitalize text-dashboard-foreground">
                        {MESES[mes]} {ano}
                    </h2>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={mesAnterior}
                            className="h-8 w-8 rounded-[7px] text-dashboard-muted hover:bg-dashboard-surface-hover hover:text-dashboard-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={proximoMes}
                            className="h-8 w-8 rounded-[7px] text-dashboard-muted hover:bg-dashboard-surface-hover hover:text-dashboard-primary"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1">
                    {DIAS.map((dia) => (
                        <div
                            key={dia}
                            className="flex h-10 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.12em] text-dashboard-subtle"
                        >
                            {dia}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">{dias}</div>

                <div className="mt-6 rounded-[10px] border border-dashboard-border bg-dashboard-background p-4">
                    <p className="font-heading text-lg font-semibold capitalize text-dashboard-foreground" suppressHydrationWarning>
                        {dataSelecionada.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dashboard-primary">
                        {eventosPorDia[obterChaveDia(dataSelecionada.getDate())] || 0} agendamentos
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
