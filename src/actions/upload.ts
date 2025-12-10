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

        // Validate file type (basic check)
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/avif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Formato de arquivo não suportado" }
        }

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads")
        await mkdir(uploadDir, { recursive: true })

        // Create unique filename
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
