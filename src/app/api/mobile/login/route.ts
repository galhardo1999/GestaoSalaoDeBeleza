import { db } from "@/lib/db"
import { aplicarRateLimit, criarTokenMobile, obterIpRequisicao } from "@/lib/seguranca"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const loginMobileSchema = z.object({
    cnpj: z.string().min(11).max(18).transform((valor) => valor.replace(/\D/g, "")),
    password: z.string().min(1).max(128),
})

const HASH_DUMMY = "$2b$12$QZFbOv4D..danWphB6CJJOAOtZ.oQPUsezMV8q0X6.7nL5806uwJa"

export async function POST(req: Request) {
    try {
        const body: unknown = await req.json()
        const parsed = loginMobileSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "Dados invalidos", details: parsed.error.flatten() },
                { status: 400 },
            )
        }

        const { cnpj, password } = parsed.data
        const ip = obterIpRequisicao(req.headers)
        const limite = aplicarRateLimit(`login_mobile:${ip}:${cnpj}`, 5)

        if (!limite.permitido) {
            return NextResponse.json(
                { success: false, error: "Muitas tentativas. Tente novamente em instantes." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((limite.resetEm - Date.now()) / 1000).toString(),
                    },
                },
            )
        }

        const user = await db.usuario.findUnique({
            where: { cnpj },
            include: {
                empresa: true,
            },
        })

        if (!user) {
            await compare(password, HASH_DUMMY)
            return NextResponse.json({ success: false, error: "Credenciais invalidas" }, { status: 401 })
        }

        const senhaValida = await compare(password, user.senha)

        if (!senhaValida) {
            return NextResponse.json({ success: false, error: "Credenciais invalidas" }, { status: 401 })
        }

        if (!user.empresaId) {
            return NextResponse.json({ success: false, error: "Usuario sem empresa vinculada" }, { status: 403 })
        }

        const token = criarTokenMobile({
            usuarioId: user.id,
            empresaId: user.empresaId,
            cargo: user.cargo,
        })

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                nome: user.nome,
                cnpj: user.cnpj,
                cargo: user.cargo,
                empresaId: user.empresaId,
                empresaNome: user.empresa?.nome,
            },
        })
    } catch (erro) {
        console.error("Login mobile error:", erro)
        return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
    }
}
