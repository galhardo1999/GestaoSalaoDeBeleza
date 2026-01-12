import { db } from "@/lib/db"

export async function checkPlanStatus(empresaId: string): Promise<boolean> {
    const activeContract = await db.contrato.findFirst({
        where: {
            empresaId,
            ativo: true,
            fim: {
                gte: new Date()
            }
        }
    })

    return !!activeContract
}
