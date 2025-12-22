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

        // Sanitize CNPJ input (remove non-digits) to ensure matching with DB
        const cleanCnpj = cnpj.replace(/\D/g, "")

        console.log("------------------------------------------")
        console.log("MOBILE LOGIN REQUEST RECEIVED")
        console.log("Raw CNPJ:", cnpj)
        console.log("Clean CNPJ:", cleanCnpj)
        console.log("Password provided:", !!password)

        const user = await db.usuario.findUnique({
            where: { cnpj: cleanCnpj },
            include: {
                empresa: true
            }
        })

        console.log("User found in DB:", !!user ? "YES" : "NO")
        if (user) {
            console.log("User Cargo:", user.cargo)
            console.log("User Hash:", user.senha.substring(0, 10) + "...")
        }

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
