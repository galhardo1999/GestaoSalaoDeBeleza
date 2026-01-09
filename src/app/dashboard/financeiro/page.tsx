import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import { OverviewCards } from "@/components/financeiro/overview-cards"
import { SalesChart } from "@/components/financeiro/sales-chart"
import { TopServices } from "@/components/financeiro/top-services"
import { startOfMonth, endOfMonth } from "date-fns"
import { getFinancialMetrics, getFinancialMovements, getCollaborators } from "@/actions/financeiro"
import { FinancialMovementsTable } from "@/components/financeiro/financial-movements-table"
import { MonthPicker } from "@/components/financeiro/month-picker"
import { CollaboratorPicker } from "@/components/financeiro/collaborator-picker"


export const dynamic = 'force-dynamic'

// P0: Input validation helpers
function parseMonth(value: string | undefined): number {
    if (!value) return new Date().getMonth()
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 12) return new Date().getMonth()
    return parsed - 1
}

function parseYear(value: string | undefined): number {
    if (!value) return new Date().getFullYear()
    const parsed = parseInt(value, 10)
    const currentYear = new Date().getFullYear()
    if (isNaN(parsed) || parsed < 2000 || parsed > currentYear + 5) return currentYear
    return parsed
}

export default async function FinanceiroPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string, year?: string, colaboradorId?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        redirect('/login')
    }

    const params = await searchParams

    // P0: Validated input parsing
    const selectedYear = parseYear(params.year)
    const selectedMonth = parseMonth(params.month)
    const colaboradorId = params.colaboradorId

    const startDate = startOfMonth(new Date(selectedYear, selectedMonth))
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth))

    // Display string for the period
    const periodString = startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    // P0: Parallel query execution with Promise.all (~66% faster)
    const [metrics, movements, collaborators] = await Promise.all([
        getFinancialMetrics(startDate, endDate, session.user.empresaId, colaboradorId),
        getFinancialMovements(startDate, endDate, session.user.empresaId, colaboradorId),
        getCollaborators(session.user.empresaId)
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
                <div className="flex items-center space-x-2">
                    <CollaboratorPicker collaborators={collaborators} />
                    <MonthPicker currentDate={startDate} />
                </div>
            </div>

            <OverviewCards
                totalRevenue={metrics.totalRevenue}
                totalSales={metrics.totalSales}
                averageTicket={metrics.averageTicket}
                totalCommissions={metrics.totalCommissions}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <SalesChart data={metrics.dailyRevenue} />
                <TopServices services={metrics.topServices} />
            </div>

            <div className="pt-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Movimentações</h3>
                <FinancialMovementsTable data={movements} />
            </div>
        </div>
    )
}

