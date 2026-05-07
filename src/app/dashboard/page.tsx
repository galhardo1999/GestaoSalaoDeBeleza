import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { CalendarDays, FileText, Calendar as CalendarIcon } from "lucide-react"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { DashboardMetrics, DashboardMetricsSkeleton } from "@/components/dashboard/dashboard-metrics"
import { DashboardTeam, DashboardTeamSkeleton } from "@/components/dashboard/dashboard-team"
import { DashboardUpcoming, DashboardUpcomingSkeleton } from "@/components/dashboard/dashboard-upcoming"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"

// New components to be implemented
import { DashboardMetricsMonth, DashboardMetricsMonthSkeleton } from "@/components/dashboard/dashboard-metrics-month"
import { DashboardStatusOverview } from "@/components/dashboard/dashboard-status-overview"
import { DashboardTopServices } from "@/components/dashboard/dashboard-top-services"
import { DashboardBirthdays } from "@/components/dashboard/dashboard-birthdays"
import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts"
import { DashboardAvailableSlots } from "@/components/dashboard/dashboard-available-slots"

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

    const primeiroNome = session.user.name?.split(" ")[0] || "Usuário"

    if (session.user.cargo === "SUPER_ADMIN" && !session.user.empresaId) {
        return (
            <div className="flex-1 space-y-8">
                <div className="flex flex-col gap-4 border-b border-[#2A2418] pb-7 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="font-heading text-4xl font-semibold tracking-normal text-[#F5F0E8] md:text-5xl">
                            Visão geral
                        </h2>
                        <p className="mt-2 text-sm capitalize text-[#A9A198]">
                            {dataFormatada}
                        </p>
                    </div>
                </div>
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-[10px] border border-dashed border-[#3A301C] bg-[#111111] shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                    <h3 className="font-heading text-2xl font-semibold text-[#F5F0E8]">Nenhuma empresa selecionada</h3>
                    <p className="text-sm text-[#A9A198]">Selecione uma empresa no menu lateral para visualizar os dados.</p>
                </div>
            </div>
        )
    }

    if (!session.user.empresaId) {
        return null
    }

    const empresa = await db.empresa.findUnique({
        where: { id: session.user.empresaId },
    })

    return (
        <div className="flex-1 space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[#2A2418] pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-heading text-3xl font-semibold tracking-normal text-[#F5F0E8] md:text-4xl">
                        Visão geral
                    </h2>
                    <p className="mt-1 text-sm capitalize text-[#A9A198]">
                        {dataFormatada}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-[#2A2418] bg-[#111111] text-[#F5F0E8] hover:bg-[#1B1B1B] hover:text-[#D4AF37]">
                        <FileText className="mr-2 h-4 w-4" />
                        Relatório
                    </Button>
                    <Button className="bg-[#D4AF37] text-[#0D0D0D] hover:bg-[#C9A84C]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Agendar
                    </Button>
                </div>
            </div>

            {/* Metrics Section: HOJE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></div>
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-[#71685F]">Hoje</h3>
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
                    <div className="h-4 w-4 rounded-[3px] border border-[#71685F] flex items-center justify-center">
                        <CalendarDays className="h-2.5 w-2.5 text-[#71685F]" />
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-[#71685F]">Este Mês</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Suspense fallback={<DashboardMetricsMonthSkeleton />}>
                        <DashboardMetricsMonth date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>
            </div>

            {/* Main Content Grids */}
            <div className="grid gap-6 md:grid-cols-2 items-start">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                    <Suspense fallback={<DashboardUpcomingSkeleton />}>
                        <DashboardUpcoming date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                    <Suspense fallback={<div className="h-[300px] rounded-xl bg-[#111111] animate-pulse" />}>
                        <DashboardStatusOverview date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    <Suspense fallback={<DashboardTeamSkeleton />}>
                        <DashboardTeam date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                    <Suspense fallback={<div className="h-[300px] rounded-xl bg-[#111111] animate-pulse" />}>
                        <DashboardTopServices date={dataSelecionada} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>
            </div>

            {/* Bottom Widgets Row */}
            <div className="grid gap-6 md:grid-cols-3 items-start">
                <Suspense fallback={<div className="h-[300px] rounded-xl bg-[#111111] animate-pulse" />}>
                    <DashboardBirthdays date={dataSelecionada} empresaId={session.user.empresaId} />
                </Suspense>
                <Suspense fallback={<div className="h-[300px] rounded-xl bg-[#111111] animate-pulse" />}>
                    <DashboardAlerts date={dataSelecionada} empresaId={session.user.empresaId} />
                </Suspense>
                <Suspense fallback={<div className="h-[300px] rounded-xl bg-[#111111] animate-pulse" />}>
                    <DashboardAvailableSlots date={dataSelecionada} empresaId={session.user.empresaId} />
                </Suspense>
            </div>
        </div>
    )
}
