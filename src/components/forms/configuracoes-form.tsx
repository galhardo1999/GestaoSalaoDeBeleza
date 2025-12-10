"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react" // Added useRef

import { updateCompanySettings } from "@/actions/configuracoes"
import { uploadLogo } from "@/actions/upload" // New import
import Image from "next/image" // New import
import { Upload } from "lucide-react"

const formSchema = z.object({
    nome: z.string().min(2, {
        message: "Nome da empresa deve ter pelo menos 2 caracteres.",
    }),
    telefone1: z.string().optional(),
    telefone2: z.string().optional(),
    cnpj: z.string().optional(), // Read-only
    email: z.string().optional(), // Read-only
})

interface ConfiguracoesFormProps {
    initialData: any
    userId: string
    userEmail?: string | null
}

export function ConfiguracoesForm({ initialData, userId, userEmail }: ConfiguracoesFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null) // New state
    const fileInputRef = useRef<HTMLInputElement>(null) // New ref

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: initialData?.nome || "",
            telefone1: initialData?.telefone1 || "",
            telefone2: initialData?.telefone2 || "",
            cnpj: initialData?.cnpj || "",
            email: userEmail || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            const result = await updateCompanySettings(userId, {
                nome: values.nome,
                telefone1: values.telefone1,
                telefone2: values.telefone2,
                endereco: initialData?.endereco, // Preserve functionality if needed, though not in form
                logo: logoPreview || undefined // Pass logo URL
            })

            if (result.success) {
                // simple success alert if toast not found, but trying to be standard
                // console.log("Success") 
                // In a real app we'd use a toast. I'll stick to console or simple alert if generic
                // Or better, let's assume there is a toast or just finish.
                // Revalidation happens on server.
                alert("Configurações atualizadas com sucesso!")
            } else {
                alert("Erro ao atualizar: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Erro inesperado.")
        } finally {
            setIsPending(false)
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecione uma imagem.")
            return
        }

        const formData = new FormData()
        formData.append("file", file)

        setIsPending(true)
        try {
            const result = await uploadLogo(formData)
            if (result.success && result.filepath) {
                setLogoPreview(result.filepath)
            } else {
                alert("Erro ao enviar logo: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Erro ao processar upload.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Empresa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome da sua empresa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CNPJ</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled className="bg-gray-50 text-gray-500" />
                                    </FormControl>
                                    <FormDescription className="text-xs text-gray-500">
                                        O CNPJ não pode ser alterado
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="telefone1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone 1</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(00) 00000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="telefone2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone 2</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(00) 00000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled className="bg-gray-50 text-gray-500" />
                                    </FormControl>
                                    <FormDescription className="text-xs text-gray-500">
                                        O email não pode ser alterado
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Hidden button to submit form implicitly if needed? 
                            The design doesn't explicitly show a "Save" button, but it's implied. 
                            I'll add one at the bottom. */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <div className="w-full lg:w-80">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Logo
                    </h3>
                    <div
                        className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[300px] bg-gray-50 text-center space-y-4 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg, image/avif, image/webp"
                            onChange={handleFileSelect}
                            disabled={isPending}
                        />

                        {logoPreview ? (
                            <div className="relative w-40 h-40">
                                <Image
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    fill
                                    className="object-contain rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center">
                                <Upload className="h-10 w-10 text-gray-400" />
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">Clique para enviar</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            disabled={isPending}
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            Selecionar arquivo
                        </Button>
                        <p className="text-[10px] text-gray-400">Formatos: PNG, JPG, JPEG, AVIF</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
