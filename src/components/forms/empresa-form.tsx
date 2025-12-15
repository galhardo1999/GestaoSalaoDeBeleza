"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createEmpresa, consultarCNPJ } from "@/app/actions/admin-actions"
import { useState, useRef } from "react"
import { Loader2, Search } from "lucide-react"

export function EmpresaForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [isConsulting, setIsConsulting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    async function handleConsultarCNPJ(cnpj: string) {
        const cleanCNPJ = cnpj.replace(/\D/g, "")
        if (cleanCNPJ.length !== 14) return

        setIsConsulting(true)
        setError(null)

        const result = await consultarCNPJ(cleanCNPJ)
        setIsConsulting(false)

        if (result.error) {
            setError(result.error)
            return
        }

        if (result.data) {
            const d = result.data
            // Populate fields via DOM manipulation or State management if we had controlled inputs.
            // Since this is using native form submission (uncontrolled), we can set values directly on inputs if refs or names match.
            // Using formRef to access elements.

            const form = formRef.current
            if (!form) return

            // Helper to safe set value
            const setVal = (name: string, val: string) => {
                const input = form.elements.namedItem(name) as HTMLInputElement
                if (input) input.value = val
            }

            if (d.company?.name) setVal("nomeEmpresa", d.company.name)

            // Address
            if (d.address?.zip) {
                const cep = d.address.zip.replace(/\D/g, "")
                setVal("cep", cep.replace(/^(\d{5})(\d{1,3})/, "$1-$2"))
            }
            if (d.address?.street) setVal("endereco", d.address.street)
            if (d.address?.number) setVal("numero", d.address.number)
            if (d.address?.district) setVal("bairro", d.address.district)
            if (d.address?.city) setVal("cidade", d.address.city)
            if (d.address?.state) setVal("estado", d.address.state)

            // Helper to format phone
            const formatPhone = (area: string, number: string) => {
                const combined = `${area}${number}`.replace(/\D/g, "")
                if (combined.length > 10) {
                    return combined.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
                }
                if (combined.length > 6) {
                    return combined.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
                }
                return combined
            }

            // Phones
            if (d.phones && d.phones.length > 0) {
                const p1 = d.phones[0]
                setVal("telefone1", formatPhone(p1.area, p1.number))

                if (d.phones.length > 1) {
                    const p2 = d.phones[1]
                    setVal("telefone2", formatPhone(p2.area, p2.number))
                }
            }
        }
    }

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
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Dados da Empresa</h3>

                        {/* CNPJ 50% */}
                        <div className="flex">
                            <div className="w-[50%] space-y-2 relative">
                                <Label htmlFor="cnpjEmpresa">CNPJ da Empresa</Label>
                                <div className="relative">
                                    <Input
                                        id="cnpjEmpresa"
                                        name="cnpjEmpresa"
                                        required
                                        placeholder="XX.XXX.XXX/XXXX-XX"
                                        maxLength={18}
                                        onBlur={(e) => handleConsultarCNPJ(e.target.value)}
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
                                    {isConsulting && (
                                        <div className="absolute right-3 top-2.5">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
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

                                        if (v.length > 10) {
                                            v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
                                        } else if (v.length > 6) {
                                            v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
                                        } else if (v.length > 2) {
                                            v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2")
                                        } else if (v.length > 0) {
                                            v = v.replace(/^(\d{1,2})/, "($1")
                                        }

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

                                        if (v.length > 10) {
                                            v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
                                        } else if (v.length > 6) {
                                            v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
                                        } else if (v.length > 2) {
                                            v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2")
                                        } else if (v.length > 0) {
                                            v = v.replace(/^(\d{1,2})/, "($1")
                                        }

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
                                    <Input
                                        id="cep"
                                        name="cep"
                                        placeholder="00000-000"
                                        maxLength={9}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, "")
                                            if (v.length > 8) v = v.slice(0, 8)

                                            if (v.length > 5) {
                                                v = v.replace(/^(\d{5})(\d{1,3})/, "$1-$2")
                                            }

                                            e.target.value = v
                                        }}
                                    />
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
