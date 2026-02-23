import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const empresas = await db.empresa.findMany({
            select: {
                id: true,
                nome: true,
                endereco: true,
                numero: true,
                bairro: true,
                cidade: true,
                estado: true,
                logo: true,
                banner: true,
                latitude: true,
                longitude: true
            }
        })

        const empresasFormatadas = empresas.map(empresa => ({
            id: empresa.id,
            nome: empresa.nome,
            enderecoCompleto: `${empresa.endereco}, ${empresa.numero} - ${empresa.bairro}, ${empresa.cidade} - ${empresa.estado}`,
            logo: empresa.logo,
            banner: empresa.banner,
            latitude: empresa.latitude,
            longitude: empresa.longitude
        }))

        return NextResponse.json({
            success: true,
            data: empresasFormatadas
        })

    } catch (error) {
        console.error("Erro ao buscar empresas:", error)
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}
