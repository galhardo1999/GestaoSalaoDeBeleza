"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createEmpresa } from "@/app/actions/admin-actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function EmpresaForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await createEmpresa(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
        // If success, redirect happens in server action
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Nova Empresa</CardTitle>
                <CardDescription>
                    Cadastre uma nova empresa e seu usuário administrador inicial.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Dados da Empresa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                                <Input id="nomeEmpresa" name="nomeEmpresa" required placeholder="Ex: Salão Top" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cnpjEmpresa">CNPJ da Empresa</Label>
                                <Input id="cnpjEmpresa" name="cnpjEmpresa" required placeholder="00.000.000/0000-00" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Usuário Administrador</h3>
                            <span className="text-sm text-gray-500">Este usuário terá acesso total à empresa.</span>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomeUsuario">Nome do Usuário</Label>
                                    <Input id="nomeUsuario" name="nomeUsuario" required placeholder="Ex: Admin" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpjUsuario">CNPJ do Usuário (Login)</Label>
                                    <Input id="cnpjUsuario" name="cnpjUsuario" required placeholder="00.000.000/0000-00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="senhaUsuario">Senha de Acesso</Label>
                                <Input id="senhaUsuario" name="senhaUsuario" type="password" required placeholder="******" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cadastrar Empresa
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
