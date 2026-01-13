import { ConfiguracoesForm } from "@/components/forms/configuracoes-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCompanySettings } from "@/actions/configuracoes"
import { getHorariosFuncionamento } from "@/actions/horarios-funcionamento"
import { redirect } from "next/navigation"
import { SelectCompanyState } from "@/components/dashboard/select-company-state"

export default async function ConfiguracoesPage() {
    const session = await getServerSession(authOptions)



    if (!session || !session.user) {
        redirect("/login")
    }

    if (!session.user.empresaId && session.user.cargo === "SUPER_ADMIN") {
        return (
            <div className="p-8">
                <SelectCompanyState />
            </div>
        )
    }

    const { data: company, userEmail } = await getCompanySettings(session.user.id)
    const horariosData = session.user.empresaId
        ? await getHorariosFuncionamento(session.user.empresaId)
        : []

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-1">Configurações</h2>
            <p className="text-gray-500 mb-8">Gerencie suas informações e preferências</p>

            <div className="bg-white rounded-xl border p-6">
                <ConfiguracoesForm
                    initialData={company}
                    userId={session.user.id}
                    userEmail={userEmail}
                    horariosData={horariosData}
                />
            </div>
        </div>
    )
}
