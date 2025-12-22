import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { cnpj, password } = body

        if (!cnpj || !password) {
            return NextResponse.json({ success: false, error: "CNPJ e senha são obrigatórios" }, { status: 400 })
        }

        // Clean CNPJ to match database (numbers only if that's how it's stored, or raw)
        // Usually login sends raw input, let's assume valid CNPJ in DB has formatting or not.
        // Looking at auth.ts, it uses credentials.cnpj directly.
        // Let's rely on what's in the DB.

        const user = await db.usuario.findUnique({
            where: { cnpj },
            include: {
                empresa: true
            }
        })

        if (!user) {
            return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
        }

        const isPasswordValid = await compare(password, user.senha)

        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                nome: user.nome,
                cnpj: user.cnpj,
                cargo: user.cargo,
                empresaId: user.empresaId,
                empresaNome: user.empresa?.nome
            }
        })

    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
    }
}
