"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getCompaniesForSwitcher() {
    const session = await getServerSession(authOptions)

    if (session?.user?.cargo !== "SUPER_ADMIN") {
        return []
    }

    const empresas = await db.empresa.findMany({
        select: {
            id: true,
            nome: true,
            cnpj: true
        },
        orderBy: {
            nome: 'asc'
        }
    })

    return empresas.map(empresa => ({
        value: empresa.id,
        label: empresa.nome,
        cnpj: empresa.cnpj
    }))
}

export async function switchCompany(empresaId: string) {
    const session = await getServerSession(authOptions)

    if (session?.user?.cargo !== "SUPER_ADMIN") {
        throw new Error("Não autorizado")
    }

    // Verify company exists
    const empresa = await db.empresa.findUnique({
        where: { id: empresaId }
    })

    if (!empresa) {
        throw new Error("Empresa não encontrada")
    }

    // Update user's current company context
    await db.usuario.update({
        where: { id: session.user.id },
        data: {
            empresaId: empresaId
        }
    })

    revalidatePath("/")
    revalidatePath("/dashboard")

    // We can't force a session refresh easily from server side for the client
    // The client will need to refresh the page or session
}
