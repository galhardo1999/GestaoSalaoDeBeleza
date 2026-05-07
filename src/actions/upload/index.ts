"use server"

import { mkdir, writeFile } from "fs/promises"
import { randomUUID } from "crypto"
import { join } from "path"

import { aplicarRateLimit, obterSessaoObrigatoria } from "@/lib/seguranca"

const TAMANHO_MAXIMO_ARQUIVO = 2 * 1024 * 1024

const tiposPermitidos = {
    "image/jpeg": {
        extensao: "jpg",
        assinaturas: [[0xff, 0xd8, 0xff]],
    },
    "image/png": {
        extensao: "png",
        assinaturas: [[0x89, 0x50, 0x4e, 0x47]],
    },
    "image/avif": {
        extensao: "avif",
        assinaturas: [[0x66, 0x74, 0x79, 0x70]],
        deslocamento: 4,
    },
    "image/webp": {
        extensao: "webp",
        assinaturas: [[0x52, 0x49, 0x46, 0x46]],
    },
} as const

type TipoPermitido = keyof typeof tiposPermitidos

const tipoPermitido = (tipo: string): tipo is TipoPermitido =>
    tipo in tiposPermitidos

const possuiAssinaturaValida = (buffer: Buffer, tipo: TipoPermitido) => {
    const regra = tiposPermitidos[tipo]
    const deslocamento = "deslocamento" in regra ? regra.deslocamento : 0

    return regra.assinaturas.some((assinatura) =>
        assinatura.every((byte, indice) => buffer[deslocamento + indice] === byte),
    )
}

export async function uploadLogo(formData: FormData) {
    try {
        const session = await obterSessaoObrigatoria()
        if (!session) {
            return { success: false, error: "Sem permissao" }
        }

        const limite = aplicarRateLimit(`upload:${session.user.id}`, 20, 60 * 1000)
        if (!limite.permitido) {
            return { success: false, error: "Muitos uploads. Tente novamente em instantes." }
        }

        const arquivo = formData.get("file")
        if (!(arquivo instanceof File)) {
            return { success: false, error: "Nenhum arquivo enviado" }
        }

        if (arquivo.size <= 0 || arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
            return { success: false, error: "Arquivo excede o limite de 2 MB" }
        }

        if (!tipoPermitido(arquivo.type)) {
            return { success: false, error: "Formato de arquivo nao suportado" }
        }

        const bytes = await arquivo.arrayBuffer()
        const buffer = Buffer.from(bytes)

        if (!possuiAssinaturaValida(buffer, arquivo.type)) {
            return { success: false, error: "Conteudo do arquivo nao corresponde ao tipo informado" }
        }

        const uploadDir = join(process.cwd(), "public", "uploads", session.user.empresaId)
        await mkdir(uploadDir, { recursive: true })

        const filename = `${randomUUID()}.${tiposPermitidos[arquivo.type].extensao}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer, { flag: "wx" })

        return {
            success: true,
            filepath: `/uploads/${session.user.empresaId}/${filename}`,
        }
    } catch (erro) {
        console.error("Upload error:", erro)
        return { success: false, error: "Erro ao fazer upload do arquivo" }
    }
}
