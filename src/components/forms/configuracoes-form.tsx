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
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState, useRef } from "react"

import { updateCompanySettings } from "@/actions/configuracoes"
import { uploadLogo } from "@/actions/upload"
import Image from "next/image"
import { Upload } from "lucide-react"

const formSchema = z.object({
    nome: z.string().min(2, {
        message: "Nome da empresa deve ter pelo menos 2 caracteres.",
    }),
    telefone1: z.string().optional(),
    telefone2: z.string().optional(),
    cnpj: z.string().optional(),
    email: z.string().optional(),
    mensagemWhatsapp: z.string().optional(),
    googleAvaliacaoUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
})

interface ConfiguracoesFormProps {
    initialData: any
    userId: string
    userEmail?: string | null
}

export function ConfiguracoesForm({ initialData, userId, userEmail }: ConfiguracoesFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null)
    const [activeTab, setActiveTab] = useState<'details' | 'messages'>('details')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: initialData?.nome || "",
            telefone1: initialData?.telefone1 || "",
            telefone2: initialData?.telefone2 || "",
            cnpj: initialData?.cnpj || "",
            email: userEmail || "",
            mensagemWhatsapp: initialData?.mensagemWhatsapp || "",
            googleAvaliacaoUrl: initialData?.googleAvaliacaoUrl || "",
            instagramUrl: initialData?.instagramUrl || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            const result = await updateCompanySettings(userId, {
                nome: values.nome,
                telefone1: values.telefone1,
                telefone2: values.telefone2,
                endereco: initialData?.endereco,
                logo: logoPreview || undefined,
                mensagemWhatsapp: values.mensagemWhatsapp,
                googleAvaliacaoUrl: values.googleAvaliacaoUrl,
                instagramUrl: values.instagramUrl,
            })

            if (result.success) {
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
        <div className="flex flex-col gap-8">
            <div className="flex gap-4 border-b">
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'details' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Dados da Empresa
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('messages')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'messages' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Mensagens
                </button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className={activeTab === 'details' ? 'flex flex-col lg:flex-row gap-8' : 'hidden'}>
                        <div className="flex-1 space-y-6">
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
                                                <Input
                                                    placeholder="(00) 00000-0000"
                                                    {...field}
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

                                                        field.onChange(v)
                                                    }}
                                                />
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
                                                <Input
                                                    placeholder="(00) 00000-0000"
                                                    {...field}
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

                                                        field.onChange(v)
                                                    }}
                                                />
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

                            <FormField
                                control={form.control}
                                name="googleAvaliacaoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link para Avaliação no Google</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://g.page/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="instagramUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instagram</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://instagram.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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

                    <div className={activeTab === 'messages' ? 'space-y-6 max-w-2xl' : 'hidden'}>
                        <FormField
                            control={form.control}
                            name="mensagemWhatsapp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensagem Padrão do WhatsApp</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Digite a mensagem padrão que será preenchida ao enviar whatsapp para o cliente..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Esta mensagem será usada como modelo ao clicar no botão de WhatsApp nos agendamentos.
                                        Você pode usar o texto como base e editar antes de enviar.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
