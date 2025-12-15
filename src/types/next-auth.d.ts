import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name: string
            cnpj: string
            cargo: "ADMIN" | "FUNCIONARIO" | "SUPER_ADMIN"
            empresaId: string
        }
    }
}
