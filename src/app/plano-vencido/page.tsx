"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, LogOut, MessageCircle } from "lucide-react"
import { signOut } from "next-auth/react"

export default function PlanoVencidoPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md border-red-200">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-700">Plano Vencido</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        O plano de assinatura da sua empresa expirou.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border border-red-100 text-center text-gray-700">
                        <p>
                            Para continuar utilizando o sistema, é necessário renovar sua assinatura.
                            Entre em contato com o suporte para regularizar o acesso.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Falar com Suporte
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <LogOut className="h-4 w-4" />
                            Sair do Sistema
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
