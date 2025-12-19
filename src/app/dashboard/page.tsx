
import { Suspense } from "react"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardMetrics, DashboardMetricsSkeleton } from "@/components/dashboard/dashboard-metrics"
import { DashboardUpcoming, DashboardUpcomingSkeleton } from "@/components/dashboard/dashboard-upcoming"

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const params = await searchParams
    const dateParam = params.date
    const now = new Date()

    // Default to today if no date provided
    let targetDate = now
    if (dateParam) {
        const [y, m, d] = dateParam.split('-').map(Number)
        targetDate = new Date(y, m - 1, d)
    }

    // Format for display: 16 de Dezembro de 2025
    const displayDate = targetDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        redirect('/login')
    }

    const firstName = session.user.name?.split(' ')[0] || 'Usuário'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bem Vindo, {firstName}!✨</h2>
                    <p className="text-muted-foreground capitalize">{displayDate}</p>
                </div>
            </div>

            <Suspense fallback={<DashboardMetricsSkeleton />}>
                <DashboardMetrics date={targetDate} empresaId={session.user.empresaId} />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Suspense fallback={<DashboardUpcomingSkeleton />}>
                        <DashboardUpcoming date={targetDate} empresaId={session.user.empresaId} />
                    </Suspense>
                </div>
                <div className="space-y-4">
                    <DashboardCalendar />
                </div>
            </div>
        </div>
    )
}

