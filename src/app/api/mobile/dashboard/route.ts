import { db } from "@/lib/db"
import { aplicarRateLimit, obterIpRequisicao, verificarTokenMobile } from "@/lib/seguranca"
import { NextResponse } from "next/server"
import { z } from "zod"

const consultaEmpresaSchema = z.object({
    empresaId: z.string().cuid().optional(),
})

export async function GET(req: Request) {
    const ip = obterIpRequisicao(req.headers)
    const limite = aplicarRateLimit(`mobile_dashboard:${ip}`, 120, 60 * 1000)

    if (!limite.permitido) {
        return NextResponse.json({ success: false, error: "Muitas requisicoes" }, { status: 429 })
    }

    const token = verificarTokenMobile(req.headers)
    const { searchParams } = new URL(req.url)
    const parsed = consultaEmpresaSchema.safeParse({
        empresaId: searchParams.get("empresaId") ?? undefined,
    })

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: "Dados invalidos", details: parsed.error.flatten() },
            { status: 400 },
        )
    }

    const empresaId = token?.empresaId ?? parsed.data.empresaId

    if (!empresaId) {
        return NextResponse.json({ success: false, error: "Empresa ID e obrigatorio" }, { status: 400 })
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
                        duracaoMin: true,
                    },
                },
                colaboradores: {
                    select: {
                        id: true,
                        nome: true,
                        foto: true,
                    },
                },
            },
        })

        if (!empresa) {
            return NextResponse.json({ success: false, error: "Empresa nao encontrada" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: empresa,
        })
    } catch (erro) {
        console.error("Erro ao buscar dashboard mobile:", erro)
        return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
    }
}
