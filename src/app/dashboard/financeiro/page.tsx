import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getFinancialMetrics } from "@/actions/financeiro"
import { OverviewCards } from "@/components/financeiro/overview-cards"
import { SalesChart } from "@/components/financeiro/sales-chart"
import { TopServices } from "@/components/financeiro/top-services"
import { startOfMonth, endOfMonth } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string, year?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.empresaId) {
        redirect('/login')
    }

    const params = await searchParams
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    const selectedYear = params.year ? parseInt(params.year) : currentYear
    const selectedMonth = params.month ? parseInt(params.month) - 1 : currentMonth

    const startDate = startOfMonth(new Date(selectedYear, selectedMonth))
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth))

    // Display string for the period
    const periodString = startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    const metrics = await getFinancialMetrics(startDate, endDate, session.user.empresaId)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
                <div className="flex items-center space-x-2">
                    {/* Placeholder for Date Picker if needed later */}
                    <span className="text-muted-foreground capitalize">{periodString}</span>
                </div>
            </div>

            <OverviewCards
                totalRevenue={metrics.totalRevenue}
                totalSales={metrics.totalSales}
                averageTicket={metrics.averageTicket}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <SalesChart data={metrics.dailyRevenue} />
                <TopServices services={metrics.topServices} />
            </div>
        </div>
    )
}
