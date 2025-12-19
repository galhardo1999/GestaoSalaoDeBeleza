"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function uploadLogo(formData: FormData) {
    try {
        const file = formData.get("file") as File
        if (!file) {
            return { success: false, error: "Nenhum arquivo enviado" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validar tipo de arquivo (verificação básica)
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/avif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Formato de arquivo não suportado" }
        }

        // Garantir que o diretório existe
        const uploadDir = join(process.cwd(), "public", "uploads")
        await mkdir(uploadDir, { recursive: true })

        // Criar nome de arquivo único
        const extension = file.type.split("/")[1]
        const filename = `${randomUUID()}.${extension}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        return {
            success: true,
            filepath: `/uploads/${filename}`
        }
    } catch (error) {
        console.error("Upload error:", error)
        return { success: false, error: "Erro ao fazer upload do arquivo" }
    }
}
