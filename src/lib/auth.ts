import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                cnpj: { label: "CNPJ", type: "text" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.cnpj || !credentials?.password) {
                    return null
                }

                const user = await db.usuario.findUnique({
                    where: {
                        cnpj: credentials.cnpj
                    }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(credentials.password, user.senha)

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    cnpj: user.cnpj,
                    name: user.nome,
                    email: undefined, // Explicitly undefined as we use CNPJ now
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                // @ts-ignore
                session.user.cnpj = token.cnpj as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.cnpj = user.cnpj
            }
            return token
        }
    }
}
