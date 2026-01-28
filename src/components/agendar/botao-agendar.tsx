"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, User } from "lucide-react"
import { WizardAgendamento } from "./wizard-agendamento"

interface Servico {
    id: string
    nome: string
    preco: number
    duracaoMin: number
}

interface Colaborador {
    id: string
    nome: string | null
    foto: string | null
    servicos: { id: string }[]
}

interface HorarioColaborador {
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
    colaboradorId: string
}

interface HorarioFuncionamento {
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
}

interface Agendamento {
    data: Date
    colaboradorId: string | null
    agendamento_itens: {
        duracao: number
    }[]
}

interface BotaoAgendarProps {
    empresaSlug: string
    empresaId: string
    empresaNome: string
    servicos: Servico[]
    colaboradores: Colaborador[]
    horariosColaborador: HorarioColaborador[]
    horariosFuncionamento: HorarioFuncionamento[]
    agendamentosExistentes: Agendamento[]
    className?: string
}

export function BotaoAgendar({
    empresaSlug,
    empresaId,
    empresaNome,
    servicos,
    colaboradores,
    horariosColaborador,
    horariosFuncionamento,
    agendamentosExistentes,
    className
}: BotaoAgendarProps) {
    const { data: session, status } = useSession()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showWizard, setShowWizard] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleAgendarClick = () => {
        if (status === "loading") return

        if (!session) {
            // User not logged in - show login modal
            setShowLoginModal(true)
        } else {
            // User is logged in - open wizard
            setShowWizard(true)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            await signIn("google", {
                callbackUrl: `/agendar/${empresaSlug}`,
            })
        } catch (error) {
            console.error("Error signing in with Google:", error)
            setIsLoading(false)
        }
    }

    // Demo login for testing without Google credentials
    const handleDemoLogin = () => {
        setIsLoading(true)
        // Simulate a login action - close modal and open wizard
        setTimeout(() => {
            setIsLoading(false)
            setShowLoginModal(false)
            setShowWizard(true)
        }, 500)
    }

    return (
        <>
            <Button
                onClick={handleAgendarClick}
                className={className}
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando...
                    </>
                ) : (
                    "Agendar agora"
                )}
            </Button>

            {/* Login Modal */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-bold text-center">
                            Faça login para agendar
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Entre com sua conta para continuar com o agendamento
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium gap-3"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            Continuar com Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    ou
                                </span>
                            </div>
                        </div>

                        {/* Demo button for testing */}
                        <Button
                            variant="secondary"
                            className="w-full h-12 text-base font-medium gap-3"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                        >
                            <User className="h-5 w-5" />
                            Continuar como visitante
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Entre com sua conta Google para agendar de forma rápida e segura.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Booking Wizard */}
            <WizardAgendamento
                open={showWizard}
                onOpenChange={setShowWizard}
                empresaId={empresaId}
                empresaNome={empresaNome}
                servicos={servicos}
                colaboradores={colaboradores}
                horariosColaborador={horariosColaborador}
                horariosFuncionamento={horariosFuncionamento}
                agendamentosExistentes={agendamentosExistentes}
            />
        </>
    )
}
