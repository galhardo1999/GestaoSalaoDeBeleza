import { LoginForm } from "@/components/forms/auth/login-form"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
    title: "Login | Gestão Salão",
    description: "Acesse o sistema de gestão.",
}

export default async function LoginPage() {
    const session = await getServerSession(authOptions)

    if (session) {
        // @ts-ignore
        if (session.user?.cargo === "SUPER_ADMIN") {
            redirect("/admin")
        }
        redirect("/dashboard")
    }

    return <LoginForm />
}
