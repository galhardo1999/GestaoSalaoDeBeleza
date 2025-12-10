import { LoginForm } from "@/components/forms/auth/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Login | Gestão Salão",
    description: "Acesse o sistema de gestão.",
}

export default function LoginPage() {
    return <LoginForm />
}
