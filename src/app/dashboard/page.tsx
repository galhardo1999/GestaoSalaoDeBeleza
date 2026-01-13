
import { Suspense } from "react"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardMetrics, DashboardMetricsSkeleton } from "@/components/dashboard/dashboard-metrics"
import { DashboardUpcoming, DashboardUpcomingSkeleton } from "@/components/dashboard/dashboard-upcoming"
import { DashboardTeam, DashboardTeamSkeleton } from "@/components/dashboard/dashboard-team"
import { BookingLinkCard } from "@/components/dashboard/booking-link-card"
import { db } from "@/lib/db"

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

    // Allow SUPER_ADMIN to access without empresaId, but redirect others
    if (!session) {
        redirect('/login')
    }

    if (session.user.cargo !== "SUPER_ADMIN" && !session.user.empresaId) {
        redirect('/login')
    }

    const firstName = session.user.name?.split(' ')[0] || 'Usuário'

    if (session.user.cargo === "SUPER_ADMIN" && !session.user.empresaId) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Bem Vindo, {firstName}!✨</h2>
                        <p className="text-muted-foreground capitalize">{displayDate}</p>
                    </div>
                </div>
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed">
                    <h3 className="text-lg font-semibold text-gray-900">Nenhuma empresa selecionada</h3>
                    <p className="text-sm text-gray-500">Selecione uma empresa no menu lateral para visualizar os dados.</p>
                </div>
            </div>
        )
    }

    // Checking strictly that empresaId exists here to satisfy TS for components below
    if (!session.user.empresaId) return null

    // Fetch company name for booking link
    const empresa = await db.empresa.findUnique({
        where: { id: session.user.empresaId }
    })
    const empresaSlug = empresa?.slug || ''
    const empresaNome = empresa?.nome || 'empresa'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bem Vindo, {firstName}!✨</h2>
                    <p className="text-muted-foreground capitalize">{displayDate}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Suspense fallback={<DashboardMetricsSkeleton />}>
                            <DashboardMetrics date={targetDate} empresaId={session.user.empresaId} />
                        </Suspense>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Suspense fallback={<DashboardUpcomingSkeleton />}>
                            <DashboardUpcoming date={targetDate} empresaId={session.user.empresaId} />
                        </Suspense>
                        <Suspense fallback={<DashboardTeamSkeleton />}>
                            <DashboardTeam empresaId={session.user.empresaId} />
                        </Suspense>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <DashboardCalendar />
                    <BookingLinkCard empresaSlug={empresaSlug} />
                </div>
            </div>
        </div>
    )
}

