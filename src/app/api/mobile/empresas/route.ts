import { db } from "@/lib/db"
import { aplicarRateLimit, obterIpRequisicao } from "@/lib/seguranca"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const ip = obterIpRequisicao(req.headers)
    const limite = aplicarRateLimit(`mobile_empresas:${ip}`, 120, 60 * 1000)

    if (!limite.permitido) {
        return NextResponse.json({ success: false, error: "Muitas requisicoes" }, { status: 429 })
    }

    try {
        const empresas = await db.empresa.findMany({
            take: 100,
            orderBy: { nome: "asc" },
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
                longitude: true,
            },
        })

        const empresasFormatadas = empresas.map((empresa) => ({
            id: empresa.id,
            nome: empresa.nome,
            enderecoCompleto: `${empresa.endereco ?? ""}, ${empresa.numero ?? ""} - ${empresa.bairro ?? ""}, ${empresa.cidade ?? ""} - ${empresa.estado ?? ""}`,
            logo: empresa.logo,
            banner: empresa.banner,
            latitude: empresa.latitude,
            longitude: empresa.longitude,
        }))

        return NextResponse.json({
            success: true,
            data: empresasFormatadas,
        })
    } catch (erro) {
        console.error("Erro ao buscar empresas mobile:", erro)
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}
