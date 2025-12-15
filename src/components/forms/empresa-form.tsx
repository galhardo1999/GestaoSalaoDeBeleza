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
        <Card className="w-full">
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

                        {/* CNPJ 50% */}
                        <div className="flex">
                            <div className="w-[50%] space-y-2">
                                <Label htmlFor="cnpjEmpresa">CNPJ da Empresa</Label>
                                <Input
                                    id="cnpjEmpresa"
                                    name="cnpjEmpresa"
                                    required
                                    placeholder="XX.XXX.XXX/XXXX-XX"
                                    maxLength={18}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "")
                                        if (value.length > 14) value = value.slice(0, 14)

                                        // Mask: XX.XXX.XXX/XXXX-XX
                                        if (value.length > 12) {
                                            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")
                                        } else if (value.length > 8) {
                                            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, "$1.$2.$3/$4")
                                        } else if (value.length > 5) {
                                            value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, "$1.$2.$3")
                                        } else if (value.length > 2) {
                                            value = value.replace(/^(\d{2})(\d{0,3}).*/, "$1.$2")
                                        }

                                        e.target.value = value
                                    }}
                                />
                            </div>
                        </div>

                        {/* Nome da Empresa 100% */}
                        <div className="space-y-2">
                            <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                            <Input id="nomeEmpresa" name="nomeEmpresa" required placeholder="Ex: Salão Top" />
                        </div>

                        {/* Contact Section */}
                        <h3 className="text-lg font-medium pt-4">Contato</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="telefone1">Telefone 1</Label>
                                <Input
                                    id="telefone1"
                                    name="telefone1"
                                    placeholder="(00) 00000-0000"
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, "")
                                        if (v.length > 11) v = v.slice(0, 11)
                                        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3")
                                        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3")
                                        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2")
                                        e.target.value = v
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone2">Telefone 2</Label>
                                <Input
                                    id="telefone2"
                                    name="telefone2"
                                    placeholder="(00) 0000-0000"
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, "")
                                        if (v.length > 11) v = v.slice(0, 11)
                                        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3")
                                        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3")
                                        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2")
                                        e.target.value = v
                                    }}
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-medium pt-4">Endereço</h3>
                        <div className="space-y-4">
                            {/* CEP - 30% */}
                            <div className="flex">
                                <div className="w-[30%] space-y-2">
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input id="cep" name="cep" placeholder="00000-000" />
                                </div>
                            </div>

                            {/* Endereço 80% / Numero 20% */}
                            <div className="flex gap-4">
                                <div className="w-[80%] space-y-2">
                                    <Label htmlFor="endereco">Endereço</Label>
                                    <Input id="endereco" name="endereco" placeholder="Rua, Avenida..." />
                                </div>
                                <div className="w-[20%] space-y-2">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input id="numero" name="numero" placeholder="123" />
                                </div>
                            </div>

                            {/* Bairro 40% / Cidade 40% / UF 20% */}
                            <div className="flex gap-4">
                                <div className="w-[40%] space-y-2">
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input id="bairro" name="bairro" placeholder="Centro" />
                                </div>
                                <div className="w-[40%] space-y-2">
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input id="cidade" name="cidade" placeholder="São Paulo" />
                                </div>
                                <div className="w-[20%] space-y-2">
                                    <Label htmlFor="estado">UF</Label>
                                    <Input id="estado" name="estado" placeholder="SP" maxLength={2} className="uppercase" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Removed: Usuário Administrador */}

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
