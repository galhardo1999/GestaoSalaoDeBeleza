import { db } from "@/lib/db"

export async function expireAppointments() {
    try {
        await db.agendamento.updateMany({
            where: {
                status: 'PENDENTE',
                data: {
                    lt: new Date()
                }
            },
            data: {
                status: 'NAO_COMPARECEU'
            }
        })
    } catch (error) {
        console.error("Failed to expire appointments:", error)
    }
}
