import { getPlanos } from "@/actions/admin/planos"
import { NewPlanDialog } from "./components/new-plan-dialog"
import { PlansTable } from "./components/plans-table"

export default async function AdminPlanosPage() {
    const planos = await getPlanos()

    const formattedPlanos = planos.map(plano => ({
        ...plano,
        valor: Number(plano.valor)
    }))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Planos</h2>
                    <p className="text-gray-500 mt-2">Gerencie os planos de assinatura disponíveis.</p>
                </div>
                <NewPlanDialog />
            </div>

            <PlansTable data={formattedPlanos} />
        </div>
    )
}
