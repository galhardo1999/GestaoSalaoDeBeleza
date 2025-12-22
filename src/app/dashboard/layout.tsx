import { DashboardShell } from "@/components/layout/dashboard-shell"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const user = await db.usuario.findUnique({
        where: { id: session.user.id },
        include: { empresa: true }
    })

    return (
        <DashboardShell
            companyName={user?.empresa?.nome}
            companyCnpj={user?.empresa?.cnpj}
            userName={user?.nome}
            userCargo={user?.cargo}
        >
            {children}
        </DashboardShell>
    )
}
