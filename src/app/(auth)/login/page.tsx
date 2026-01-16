import { LoginForm } from "@/components/forms/auth/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Login | Gestão Salão de Beleza",
    description: "Acesse sua conta para gerenciar o salão.",
}

export default function LoginPage() {
    return <LoginForm />
}
