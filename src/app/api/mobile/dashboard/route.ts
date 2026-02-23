import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresaId')

    if (!empresaId) {
        return NextResponse.json({ success: false, error: "Empresa ID é obrigatório" }, { status: 400 })
    }

    try {
        const empresa = await db.empresa.findUnique({
            where: { id: empresaId },
            select: {
                id: true,
                nome: true,
                endereco: true,
                numero: true,
                bairro: true,
                cidade: true,
                estado: true,
                banner: true,
                logo: true,
                servicos: {
                    where: { ativo: true },
                    select: {
                        id: true,
                        nome: true,
                        preco: true,
                        duracaoMin: true
                    }
                },
                colaboradores: {
                    select: {
                        id: true,
                        nome: true,
                        foto: true
                    }
                }
            }
        })

        if (!empresa) {
            return NextResponse.json({ success: false, error: "Empresa não encontrada" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: empresa
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}
