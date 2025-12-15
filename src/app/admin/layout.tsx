import { AdminShell } from "@/components/layout/admin-shell"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    // Strictly enforce SUPER_ADMIN role for this layout
    if (session?.user?.cargo !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    return (
        <AdminShell>
            {children}
        </AdminShell>
    )
}
