import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, MapPin, Clock, Search, Heart, Star, Instagram, Facebook, Wifi, Car, Accessibility, Snowflake, Tv, Coffee, Sofa, Dog, Baby, Armchair, Utensils } from "lucide-react"

// Force dynamic behavior ensuring slug is always read freshly
export const dynamic = "force-dynamic"

interface BookingPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function BookingPage({ params }: BookingPageProps) {
    const { slug } = await params

    // Fetch company data including related services and hours
    const empresa = await db.empresa.findUnique({
        where: { slug },
        include: {
            servicos: {
                where: { ativo: true }
            },
            horariosFuncionamento: {
                orderBy: { diaSemana: 'asc' }
            },
            colaboradores: true,
        }
    })

    if (!empresa) {
        notFound()
    }

    // Format address
    const address = [
        empresa.endereco,
        empresa.numero,
        empresa.bairro,
        empresa.cidade && empresa.estado ? `${empresa.cidade}/${empresa.estado}` : empresa.cidade
    ].filter(Boolean).join(", ")

    // Helper for formatting currency
    const formatPrice = (price: any) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(price))
    }

    // Helper for payment methods
    const getPaymentMethods = (jsonMethods: string | null) => {
        if (!jsonMethods) return []
        try {
            const methods = JSON.parse(jsonMethods) as string[]
            const methodMap: Record<string, string> = {
                "DINHEIRO": "Dinheiro",
                "CREDITO": "Cartão de Crédito",
                "DEBITO": "Cartão de Débito",
                "PIX": "PIX"
            }
            return methods.map(m => methodMap[m] || m)
        } catch {
            return []
        }
    }

    const paymentMethods = getPaymentMethods(empresa.formasPagamento)

    // Helper for day names
    const days = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"]
    const today = new Date().getDay()

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border bg-gray-100">
                            {empresa.logo ? (
                                <Image src={empresa.logo} alt={empresa.nome} fill className="object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-400">
                                    Logo
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-none">{empresa.nome}</h1>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium text-gray-600">5.0</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                            <Heart className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button className="bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-full px-6 h-9 font-medium">
                            Agendar agora
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Banner */}
                    <div className="relative w-full h-[200px] md:h-[300px] rounded-2xl overflow-hidden bg-gray-200">
                        {empresa.banner ? (
                            <Image src={empresa.banner} alt="Capa" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="text-lg font-medium">{empresa.nome}</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <Tabs defaultValue="servicos" className="w-full">
                        <TabsList className="w-full justify-start h-auto bg-transparent border-b rounded-none p-0 gap-6">
                            <TabsTrigger
                                value="servicos"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#FF8C00] data-[state=active]:text-[#FF8C00] data-[state=active]:shadow-none rounded-none px-0 py-3 font-semibold text-gray-500"
                            >
                                Serviços
                            </TabsTrigger>
                            <TabsTrigger
                                value="profissionais"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#FF8C00] data-[state=active]:text-[#FF8C00] data-[state=active]:shadow-none rounded-none px-0 py-3 font-semibold text-gray-500"
                            >
                                Profissionais
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            {/* Services List */}
                            <TabsContent value="servicos" className="space-y-6 mt-0">
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Serviços</h3>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Pesquisar" className="pl-9 bg-white border-gray-200" />
                                </div>

                                <div className="space-y-4">
                                    {empresa.servicos.length > 0 ? empresa.servicos.map(servico => (
                                        <div key={servico.id} className="flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-sm transition">
                                            <div className="flex items-center gap-4">

                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{servico.nome}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-sm font-medium text-green-600">
                                                            {formatPrice(servico.preco)}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{servico.duracaoMin} min</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className="bg-[#0070BA] hover:bg-[#005ea6] text-white">
                                                Agendar
                                            </Button>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center text-gray-500 bg-white rounded-xl border">
                                            Nenhum serviço disponível no momento.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Professionals List */}
                            <TabsContent value="profissionais" className="space-y-6 mt-0">
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Profissionais</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {empresa.colaboradores.length > 0 ? empresa.colaboradores.map(colaborador => (
                                        <div key={colaborador.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition">
                                            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                                                {colaborador.foto ? (
                                                    <Image src={colaborador.foto} alt={colaborador.nome || "Profissional"} fill className="object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <span className="text-xs">Foto</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{colaborador.nome}</h4>
                                                <p className="text-sm text-gray-500">Profissional</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-8 text-center text-gray-500 bg-white rounded-xl border">
                                            Nenhum profissional disponível no momento.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg">
                        <CardContent className="p-6 space-y-6">

                            {/* Location */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Localização</h3>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm text-gray-600 leading-relaxed pr-4">
                                        {address || "Endereço não cadastrado"}
                                    </p>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-900 -mt-1" asChild>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MapPin className="h-5 w-5" />
                                        </a>
                                    </Button>
                                </div>
                                {address && (
                                    <div className="w-full h-[200px] mt-4 rounded-lg overflow-hidden border bg-gray-100">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                        ></iframe>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Comodidades</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {(() => {
                                        const amenitiesMap: Record<string, { label: string, icon: any }> = {
                                            "WIFI": { label: "Wi-Fi Gratuito", icon: Wifi },
                                            "ESTACIONAMENTO": { label: "Estacionamento", icon: Car },
                                            "ACESSIBILIDADE": { label: "Acessibilidade", icon: Accessibility },
                                            "AR_CONDICIONADO": { label: "Ar Condicionado", icon: Snowflake },
                                            "TV": { label: "TV", icon: Tv },
                                            "CAFE": { label: "Café/Bebidas", icon: Coffee },
                                            "ESPERA": { label: "Sala de Espera", icon: Sofa },
                                            "PET": { label: "Pet Friendly", icon: Dog },
                                            "KIDS": { label: "Espaço Kids", icon: Baby },
                                            "TROCADOR": { label: "Trocador", icon: Armchair },
                                            "LANCHE": { label: "Lanches", icon: Utensils },
                                        }

                                        let empresaAmenities: string[] = []
                                        if (empresa.comodidades) {
                                            try {
                                                empresaAmenities = JSON.parse(empresa.comodidades)
                                            } catch {
                                                empresaAmenities = []
                                            }
                                        }

                                        if (empresaAmenities.length === 0) {
                                            return <span className="text-sm text-gray-500">Nenhuma comodidade informada</span>
                                        }

                                        return empresaAmenities.map(id => {
                                            const item = amenitiesMap[id]
                                            if (!item) return null
                                            const Icon = item.icon
                                            return (
                                                <div key={id} className="flex flex-col items-center justify-center w-full h-[70px] bg-gray-50 rounded-xl border gap-2">
                                                    <div className="h-5 w-5 text-gray-600">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-[10px] text-gray-600 text-center px-1 leading-tight">{item.label}</span>
                                                </div>
                                            )
                                        })
                                    })()}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Hours */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Horário de atendimento</h3>
                                <div className="space-y-2">
                                    {days.map((dayName, index) => {
                                        const horario = empresa.horariosFuncionamento.find(h => h.diaSemana === index)
                                        const isToday = today === index
                                        const isOpen = horario?.aberto

                                        return (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={isToday ? "font-medium text-gray-900" : "text-gray-500"}>
                                                        {dayName}
                                                    </span>
                                                    {isToday && (
                                                        <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100 h-5 px-1.5">
                                                            Hoje
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className={isToday ? "font-medium text-gray-900" : "text-gray-500"}>
                                                    {isOpen
                                                        ? `${horario?.horaAbertura} - ${horario?.horaFechamento}`
                                                        : "Fechado"}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Payment Methods */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Formas de pagamento</h3>
                                <div className="flex flex-wrap gap-2">
                                    {paymentMethods.length > 0 ? paymentMethods.map((method, i) => (
                                        <Badge key={i} variant="outline" className="text-gray-600 font-normal bg-gray-50">
                                            {method}
                                        </Badge>
                                    )) : (
                                        <span className="text-sm text-gray-500">Não informado</span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Socials / Contact */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Redes Sociais</h3>
                                <div className="flex gap-2 mb-6">

                                    {empresa.instagramUrl && (
                                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200" asChild>
                                            <a href={empresa.instagramUrl} target="_blank" rel="noopener noreferrer">
                                                <Instagram className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    {empresa.facebookUrl && (
                                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200" asChild>
                                            <a href={empresa.facebookUrl} target="_blank" rel="noopener noreferrer">
                                                <Facebook className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-3">Contato</h3>
                                <div className="space-y-3">
                                    {empresa.telefone1 && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">{empresa.telefone1}</span>
                                            </div>
                                        </div>
                                    )}
                                    {empresa.telefone2 && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">{empresa.telefone2}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
