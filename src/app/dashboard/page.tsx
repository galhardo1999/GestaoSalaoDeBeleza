import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { CalendarDays, FileText, Calendar as CalendarIcon } from "lucide-react"
import { DashboardMetrics, DashboardMetricsSkeleton } from "@/components/dashboard/dashboard-metrics"
import { DashboardTeam, DashboardTeamSkeleton } from "@/components/dashboard/dashboard-team"
import { DashboardUpcoming, DashboardUpcomingSkeleton } from "@/components/dashboard/dashboard-upcoming"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"

import { DashboardMetricsMonth, DashboardMetricsMonthSkeleton } from "@/components/dashboard/dashboard-metrics-month"
import { DashboardStatusOverview } from "@/components/dashboard/dashboard-status-overview"
import { DashboardTopServices } from "@/components/dashboard/dashboard-top-services"
import { DashboardBirthdays } from "@/components/dashboard/dashboard-birthdays"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { DashboardAvailableSlots } from "@/components/dashboard/dashboard-available-slots"
import { ThemeToggle } from "@/components/theme-toggle"

export const dynamic = "force-dynamic"

type DashboardPageProps = {
    searchParams: Promise<{ date?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const params = await searchParams
    const dateParam = params.date
    const hoje = new Date()

    let dataSelecionada = hoje
    if (dateParam) {
        const [ano, mes, dia] = dateParam.split("-").map(Number)
        dataSelecionada = new Date(ano, mes - 1, dia)
    }

    const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    if (session.user.cargo !== "SUPER_ADMIN" && !session.user.empresaId) {
        redirect("/login")
    }

    if (session.user.cargo === "SUPER_ADMIN" && !session.user.empresaId) {
        return (
            <div className="flex-1 space-y-8">
                <div className="flex flex-col gap-4 border-b border-dashboard-border pb-7 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="font-heading text-4xl font-semibold tracking-normal text-dashboard-foreground md:text-5xl">
                            Visão geral
                        </h2>
                        <p className="mt-2 text-sm capitalize text-dashboard-muted">
                            {dataFormatada}
                        </p>
                    </div>
                </div>
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-[10px] border border-dashed border-dashboard-border bg-dashboard-surface shadow-[0_24px_70px_rgba(86,66,31,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                    <h3 className="font-heading text-2xl font-semibold text-dashboard-foreground">Nenhuma empresa selecionada</h3>
                    <p className="text-sm text-dashboard-muted">Selecione uma empresa no menu lateral para visualizar os dados.</p>
                </div>
            </div>
        )
    }

    if (!session.user.empresaId) {
        return null
    }

    return (
        <div className="flex-1 space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-heading text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
                        Visão geral
                    </h2>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                        {dataFormatada}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button variant="outline" className="border-border bg-card text-foreground hover:bg-muted hover:text-primary">
                        <FileText className="mr-2 h-4 w-4" />
                        Relatório
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Agendar
                    </Button>
                </div>
            </div>

            {/* Metrics Section: HOJE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Hoje</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Suspense fallback={<DashboardMetricsSkeleton />}>
                        <DashboardMetrics date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>
            </div>

            {/* Metrics Section: ESTE MÊS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-[3px] border border-muted-foreground flex items-center justify-center">
                        <CalendarDays className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Este Mês</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Suspense fallback={<DashboardMetricsMonthSkeleton />}>
                        <DashboardMetricsMonth date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>
            </div>

            {/* Main Content Grids */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                    <Suspense fallback={<DashboardUpcomingSkeleton />}>
                        <DashboardUpcoming date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>

                {/* Middle Column */}
                <div className="flex flex-col gap-6">
                    <Suspense fallback={<div className="h-[300px] rounded-xl bg-dashboard-surface animate-pulse" />}>
                        <DashboardStatusOverview date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                    <Suspense fallback={<div className="h-[300px] rounded-xl bg-dashboard-surface animate-pulse" />}>
                        <DashboardTopServices date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    <Suspense fallback={<DashboardTeamSkeleton />}>
                        <DashboardTeam date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>
            </div>

            {/* Bottom Widgets Row */}
            <div className="grid gap-6 md:grid-cols-3 items-start">
                <Suspense fallback={<div className="h-[300px] rounded-xl bg-dashboard-surface animate-pulse" />}>
                    <DashboardBirthdays date={dataSelecionada} empresaId={session.user.empresaId} />
                </Suspense>
                <Suspense fallback={<div className="h-[300px] rounded-xl bg-dashboard-surface animate-pulse" />}>
                    <DashboardAlerts date={dataSelecionada} empresaId={session.user.empresaId} />
                </Suspense>
                <Suspense fallback={<div className="h-[300px] rounded-xl bg-dashboard-surface animate-pulse" />}>
                    <DashboardAvailableSlots date={dataSelecionada} empresaId={session.user.empresaId} />
                </Suspense>
            </div>
        </div>
    )
}
