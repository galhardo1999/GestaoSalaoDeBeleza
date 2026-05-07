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
import { Upload, Wifi, Car, Accessibility, Snowflake, Tv, Coffee, Sofa, Dog, Baby, Armchair, Utensils } from "lucide-react"

import { HorariosFuncionamentoForm } from "@/components/forms/horarios-funcionamento-form"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

const PAYMENT_METHODS = [
    { id: "DINHEIRO", label: "Dinheiro" },
    { id: "CREDITO", label: "Cartão de Crédito" },
    { id: "DEBITO", label: "Cartão de Débito" },
    { id: "PIX", label: "PIX" },
]

const AMENITIES = [
    { id: "WIFI", label: "Wi-Fi Gratuito", icon: Wifi },
    { id: "ESTACIONAMENTO", label: "Estacionamento", icon: Car },
    { id: "ACESSIBILIDADE", label: "Acessibilidade", icon: Accessibility },
    { id: "AR_CONDICIONADO", label: "Ar Condicionado", icon: Snowflake },
    { id: "TV", label: "TV", icon: Tv },
    { id: "CAFE", label: "Café/Bebidas", icon: Coffee },
    { id: "ESPERA", label: "Sala de Espera", icon: Sofa },
    { id: "PET", label: "Pet Friendly", icon: Dog },
    { id: "KIDS", label: "Espaço Kids", icon: Baby },
    { id: "TROCADOR", label: "Trocador", icon: Armchair }, // Usando Armchair como proxy visivel
    { id: "LANCHE", label: "Lanches", icon: Utensils },
]

const formSchema = z.object({
    nome: z.string().min(2, {
        message: "Nome da empresa deve ter pelo menos 2 caracteres.",
    }),
    telefone1: z.string().optional(),
    telefone2: z.string().optional(),
    cnpj: z.string().optional(),
    email: z.string().optional(),
    cep: z.string().optional(),
    endereco: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    mensagemWhatsapp: z.string().optional(),
    googleAvaliacaoUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    formasPagamento: z.array(z.string()).default([]),
    comodidades: z.array(z.string()).default([]),
})

const ABAS_CONFIGURACOES = ['details', 'messages', 'horarios', 'redes', 'pagamento', 'comodidades'] as const

type AbaConfiguracoes = typeof ABAS_CONFIGURACOES[number]
type DadosConfiguracoes = {
    nome?: string | null
    telefone1?: string | null
    telefone2?: string | null
    cnpj?: string | null
    email?: string | null
    cep?: string | null
    endereco?: string | null
    numero?: string | null
    bairro?: string | null
    cidade?: string | null
    estado?: string | null
    mensagemWhatsapp?: string | null
    googleAvaliacaoUrl?: string | null
    instagramUrl?: string | null
    facebookUrl?: string | null
    logo?: string | null
    banner?: string | null
    formasPagamento?: string | null
    comodidades?: string | null
}
type HorarioConfiguracao = {
    id?: string | null
    diaSemana: number
    aberto: boolean
    horaAbertura: string | null
    horaFechamento: string | null
}

interface ConfiguracoesFormProps {
    initialData: DadosConfiguracoes | null | undefined
    userEmail?: string | null
    horariosData?: HorarioConfiguracao[]
}

export function ConfiguracoesForm({ initialData, userEmail, horariosData }: ConfiguracoesFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.banner || null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [activeTab, setActiveTab] = useState<AbaConfiguracoes>('details')

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && ABAS_CONFIGURACOES.includes(tab as AbaConfiguracoes)) {
            setActiveTab(tab as AbaConfiguracoes)
        }
    }, [searchParams])

    const handleTabChange = (tab: AbaConfiguracoes) => {
        setActiveTab(tab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.push(`${pathname}?${params.toString()}`)
    }

    const fileInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    // Helper to parse initial payment methods
    const getInitialPaymentMethods = (): string[] => {
        if (!initialData?.formasPagamento) return []
        try {
            return JSON.parse(initialData.formasPagamento) as string[]
        } catch {
            return []
        }
    }
    const getInitialAmenities = (): string[] => {
        if (!initialData?.comodidades) return []
        try {
            return JSON.parse(initialData.comodidades) as string[]
        } catch {
            return []
        }
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: initialData?.nome || "",
            telefone1: initialData?.telefone1 || "",
            telefone2: initialData?.telefone2 || "",
            cnpj: initialData?.cnpj || "",
            email: userEmail || "",
            cep: initialData?.cep || "",
            endereco: initialData?.endereco || "",
            numero: initialData?.numero || "",
            bairro: initialData?.bairro || "",
            cidade: initialData?.cidade || "",
            estado: initialData?.estado || "",
            mensagemWhatsapp: initialData?.mensagemWhatsapp || "",
            googleAvaliacaoUrl: initialData?.googleAvaliacaoUrl || "",
            instagramUrl: initialData?.instagramUrl || "",
            facebookUrl: initialData?.facebookUrl || "",
            formasPagamento: getInitialPaymentMethods(),
            comodidades: getInitialAmenities(),
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            const result = await updateCompanySettings({
                nome: values.nome,
                telefone1: values.telefone1,
                telefone2: values.telefone2,
                cep: values.cep,
                endereco: values.endereco,
                numero: values.numero,
                bairro: values.bairro,
                cidade: values.cidade,
                estado: values.estado,
                logo: logoPreview || undefined,
                banner: bannerPreview || undefined,
                mensagemWhatsapp: values.mensagemWhatsapp,
                googleAvaliacaoUrl: values.googleAvaliacaoUrl,
                instagramUrl: values.instagramUrl,
                facebookUrl: values.facebookUrl,
                formasPagamento: JSON.stringify(values.formasPagamento),
                comodidades: JSON.stringify(values.comodidades),
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


    const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setBannerPreview(result.filepath)
            } else {
                alert("Erro ao enviar banner: " + result.error)
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
                    onClick={() => handleTabChange('details')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'details' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Dados da Empresa
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('horarios')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'horarios' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Horários de Funcionamento
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('pagamento')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'pagamento' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Formas de Pagamento
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('messages')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'messages' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Mensagens
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('redes')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'redes' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Redes Sociais
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('comodidades')}
                    className={`pb-2 border-b-2 px-4 transition-colors ${activeTab === 'comodidades' ? 'border-primary font-medium text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Comodidades
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

                            {/* Endereço */}
                            <div className="pt-4 border-t mt-6">
                                <h3 className="text-sm font-medium mb-4">Endereço</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <FormField
                                        control={form.control}
                                        name="cep"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CEP</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="00000-000"
                                                        {...field}
                                                        onChange={(e) => {
                                                            let v = e.target.value.replace(/\D/g, "")
                                                            if (v.length > 8) v = v.slice(0, 8)
                                                            if (v.length > 5) {
                                                                v = v.replace(/^(\d{5})(\d{0,3})/, "$1-$2")
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
                                        name="endereco"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Rua/Avenida</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nome da rua" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <FormField
                                        control={form.control}
                                        name="numero"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Número</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bairro"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bairro</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Bairro" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cidade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cidade</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Cidade" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="estado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>UF</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SP" maxLength={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
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

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Banner
                                </h3>
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50 text-center space-y-4 cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg, image/avif, image/webp"
                                        onChange={handleBannerSelect}
                                        disabled={isPending}
                                    />

                                    {bannerPreview ? (
                                        <div className="relative w-full h-32">
                                            <Image
                                                src={bannerPreview}
                                                alt="Banner Preview"
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Upload className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">Clique para enviar</p>
                                        <p className="text-xs text-gray-500">Recomendado: 1200x400px</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        disabled={isPending}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            bannerInputRef.current?.click();
                                        }}
                                    >
                                        Selecionar arquivo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {activeTab === 'horarios' && horariosData && (
                        <HorariosFuncionamentoForm initialData={horariosData} />
                    )}

                    <div className={activeTab === 'pagamento' ? 'space-y-6 max-w-2xl' : 'hidden'}>
                        <FormField
                            control={form.control}
                            name="formasPagamento"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Formas de Pagamento Aceitas</FormLabel>
                                        <FormDescription>
                                            Selecione as formas de pagamento que seu estabelecimento aceita.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {PAYMENT_METHODS.map((method) => {
                                            const isChecked = field.value?.includes(method.id)
                                            return (
                                                <FormItem
                                                    key={method.id}
                                                    className={`flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 shadow-sm cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-300'}`}
                                                    onClick={() => {
                                                        const newValue = isChecked
                                                            ? (field.value || []).filter((v: string) => v !== method.id)
                                                            : [...(field.value || []), method.id]
                                                        field.onChange(newValue)
                                                    }}
                                                >
                                                    <div className={`p-2 rounded-full ${isChecked ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                        {/* Placeholder icon if needed, or just keep simple for generic methods if no specific icon */}
                                                        <div className="h-4 w-4 rounded-full border-2 border-current" />
                                                    </div>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel className="cursor-pointer">
                                                            {method.label}
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className={activeTab === 'comodidades' ? 'space-y-6' : 'hidden'}>
                        <FormField
                            control={form.control}
                            name="comodidades"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Comodidades e Serviços Adicionais</FormLabel>
                                        <FormDescription>
                                            Selecione as comodidades que seu estabelecimento oferece para os clientes.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {AMENITIES.map((item) => {
                                            const Icon = item.icon
                                            const isChecked = field.value?.includes(item.id)
                                            return (
                                                <FormItem
                                                    key={item.id}
                                                    className={`flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 shadow-sm cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-300'}`}
                                                    onClick={() => {
                                                        const newValue = isChecked
                                                            ? (field.value || []).filter((v: string) => v !== item.id)
                                                            : [...(field.value || []), item.id]
                                                        field.onChange(newValue)
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3 font-normal">
                                                        <div className={`p-2 rounded-full ${isChecked ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </FormItem>
                                            )
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className={activeTab === 'messages' ? 'space-y-6 max-w-2xl' : 'hidden'}>
                        <FormField
                            control={form.control}
                            name="mensagemWhatsapp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensagem de Confirmação de Agendamento</FormLabel>
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

                    <div className={activeTab === 'redes' ? 'space-y-6 max-w-2xl' : 'hidden'}>
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

                        <FormField
                            control={form.control}
                            name="facebookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://facebook.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="googleAvaliacaoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Avaliação no Google</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://g.page/..." {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Link direto para os clientes avaliarem seu estabelecimento no Google.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {activeTab !== 'horarios' && (
                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div >
    )
}
