import { createHmac, timingSafeEqual } from "crypto"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const JANELA_PADRAO_MS = 15 * 60 * 1000
const UM_DIA_EM_SEGUNDOS = 24 * 60 * 60
const TEMPO_TOKEN_MOBILE_SEGUNDOS = 7 * UM_DIA_EM_SEGUNDOS

const tentativas = new Map<string, { total: number; expiraEm: number }>()

const tokenMobileSchema = z.object({
    usuarioId: z.string().min(1),
    empresaId: z.string().min(1),
    cargo: z.enum(["ADMIN", "FUNCIONARIO", "SUPER_ADMIN"]),
    exp: z.number().int().positive(),
})

export type SessaoAutenticada = {
    user: {
        id: string
        cargo: "ADMIN" | "FUNCIONARIO" | "SUPER_ADMIN"
        empresaId: string
    }
}

export type TokenMobile = z.infer<typeof tokenMobileSchema>

const obterSegredo = () => {
    const segredo = process.env.NEXTAUTH_SECRET
    if (!segredo) {
        throw new Error("NEXTAUTH_SECRET nao configurado")
    }
    return segredo
}

const codificarBase64Url = (valor: string) =>
    Buffer.from(valor).toString("base64url")

const assinar = (conteudo: string) =>
    createHmac("sha256", obterSegredo()).update(conteudo).digest("base64url")

const compararAssinatura = (assinaturaRecebida: string, assinaturaEsperada: string) => {
    const recebida = Buffer.from(assinaturaRecebida)
    const esperada = Buffer.from(assinaturaEsperada)

    return recebida.length === esperada.length && timingSafeEqual(recebida, esperada)
}

export const obterIpRequisicao = (headers: Headers) => {
    const encaminhado = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    return encaminhado || headers.get("x-real-ip") || "127.0.0.1"
}

export const aplicarRateLimit = (
    chave: string,
    limite: number,
    janelaMs = JANELA_PADRAO_MS,
) => {
    const agora = Date.now()
    const registro = tentativas.get(chave)

    if (!registro || registro.expiraEm <= agora) {
        tentativas.set(chave, { total: 1, expiraEm: agora + janelaMs })
        return { permitido: true, restante: limite - 1, resetEm: agora + janelaMs }
    }

    if (registro.total >= limite) {
        return { permitido: false, restante: 0, resetEm: registro.expiraEm }
    }

    registro.total += 1
    tentativas.set(chave, registro)

    return {
        permitido: true,
        restante: Math.max(0, limite - registro.total),
        resetEm: registro.expiraEm,
    }
}

export const obterSessaoObrigatoria = async (): Promise<SessaoAutenticada | null> => {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.empresaId) {
        return null
    }

    return {
        user: {
            id: session.user.id,
            cargo: session.user.cargo,
            empresaId: session.user.empresaId,
        },
    }
}

export const exigirSuperAdmin = async () => {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.cargo !== "SUPER_ADMIN") {
        throw new Error("Nao autorizado")
    }

    return session
}

export const criarTokenMobile = (dados: Omit<TokenMobile, "exp">) => {
    const header = codificarBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    const payload = codificarBase64Url(JSON.stringify({
        ...dados,
        exp: Math.floor(Date.now() / 1000) + TEMPO_TOKEN_MOBILE_SEGUNDOS,
    }))
    const conteudo = `${header}.${payload}`
    const assinatura = assinar(conteudo)

    return `${conteudo}.${assinatura}`
}

export const verificarTokenMobile = (headers: Headers): TokenMobile | null => {
    const authorization = headers.get("authorization")
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : null

    if (!token) return null

    const partes = token.split(".")
    if (partes.length !== 3) return null

    const [header, payload, assinatura] = partes
    const conteudo = `${header}.${payload}`
    const assinaturaEsperada = assinar(conteudo)

    if (!compararAssinatura(assinatura, assinaturaEsperada)) {
        return null
    }

    try {
        const dados = tokenMobileSchema.parse(
            JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
        )

        if (dados.exp < Math.floor(Date.now() / 1000)) {
            return null
        }

        return dados
    } catch {
        return null
    }
}
