import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, MapPin, Clock, Search, Star, Instagram, Facebook, Wifi, Car, Accessibility, Snowflake, Tv, Coffee, Sofa, Dog, Baby, Armchair, Utensils } from "lucide-react"
import { BotaoAgendar } from "@/components/agendar/botao-agendar"

// Force dynamic behavior ensuring slug is always read freshly
export const dynamic = "force-dynamic"

interface BookingPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function BookingPage({ params }: BookingPageProps) {
    const { slug } = await params

    // Fetch company data including related services, hours, and appointments
    const empresa = await db.empresa.findUnique({
        where: { slug },
        include: {
            servicos: {
                where: { ativo: true }
            },
            horariosFuncionamento: {
                orderBy: { diaSemana: 'asc' }
            },
            colaboradores: {
                include: {
                    servicos: {
                        select: { id: true }
                    }
                }
            },
            horariosColaborador: true,
            agendamentos: {
                where: {
                    data: {
                        gte: new Date()
                    },
                    status: {
                        in: ['AGENDADO', 'PENDENTE']
                    }
                },
                include: {
                    agendamento_itens: {
                        select: {
                            duracao: true
                        }
                    }
                }
            }
        }
    })

    if (!empresa) {
        notFound()
    }

    const address = [
        empresa.endereco,
        empresa.numero,
        empresa.bairro,
        empresa.cidade && empresa.estado ? `${empresa.cidade}/${empresa.estado}` : empresa.cidade
    ].filter(Boolean).join(", ")
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
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-blue-50 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                                <path d="M5 19l1 3 3-1-1-3-3 1z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-none">Beleza</h1>
                            <span className="text-xs text-gray-500">Gestão de Salão</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Info */}
                    {(() => {
                        // TODO: Replace with actual reviews data from database
                        const reviews: any[] = []
                        const averageRating = reviews.length > 0
                            ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                            : 0
                        const totalReviews = reviews.length

                        return (
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-lg bg-gray-100">
                                    {empresa.logo ? (
                                        <Image src={empresa.logo} alt={empresa.nome} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-400">
                                            Logo
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{empresa.nome}</h2>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isFilled = averageRating >= star
                                                const isPartial = averageRating > star - 1 && averageRating < star
                                                const fillPercentage = Math.min(100, Math.max(0, (averageRating - star + 1) * 100))

                                                return (
                                                    <div key={star} className="relative">
                                                        <Star className="h-4 w-4 text-gray-300" />
                                                        {(isFilled || isPartial) && (
                                                            <div
                                                                className="absolute inset-0 overflow-hidden"
                                                                style={{ width: isPartial ? `${fillPercentage}%` : '100%' }}
                                                            >
                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {totalReviews > 0 && (
                                            <span className="text-sm font-medium text-gray-600 ml-1">{averageRating.toFixed(1)}</span>
                                        )}
                                        <span className="text-sm text-gray-400 ml-1">• Salão de Beleza</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

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
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0070BA] data-[state=active]:text-[#0070BA] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 font-semibold text-gray-500 hover:bg-transparent"
                            >
                                Serviços
                            </TabsTrigger>
                            <TabsTrigger
                                value="profissionais"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0070BA] data-[state=active]:text-[#0070BA] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 font-semibold text-gray-500 hover:bg-transparent"
                            >
                                Profissionais
                            </TabsTrigger>
                            <TabsTrigger
                                value="avaliacoes"
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0070BA] data-[state=active]:text-[#0070BA] data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 font-semibold text-gray-500 hover:bg-transparent"
                            >
                                Avaliações
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

                            {/* Reviews List */}
                            <TabsContent value="avaliacoes" className="space-y-6 mt-0">
                                {(() => {
                                    // TODO: Replace with actual reviews data from database
                                    const reviews: any[] = []
                                    const averageRating = reviews.length > 0
                                        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                                        : 0
                                    const totalReviews = reviews.length

                                    return (
                                        <>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-gray-900">Avaliações</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => {
                                                            const fillPercentage = Math.min(100, Math.max(0, (averageRating - star + 1) * 100))
                                                            const isFilled = averageRating >= star
                                                            const isPartial = averageRating > star - 1 && averageRating < star

                                                            return (
                                                                <div key={star} className="relative">
                                                                    {/* Gray background star */}
                                                                    <Star className="h-5 w-5 text-gray-300" />
                                                                    {/* Filled overlay */}
                                                                    {(isFilled || isPartial) && (
                                                                        <div
                                                                            className="absolute inset-0 overflow-hidden"
                                                                            style={{ width: isPartial ? `${fillPercentage}%` : '100%' }}
                                                                        >
                                                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    {totalReviews > 0 && (
                                                        <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {totalReviews === 0 ? (
                                                    /* Empty state */
                                                    <div className="py-12 text-center bg-white rounded-xl border">
                                                        <div className="flex justify-center gap-1 mb-4">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star key={star} className="h-8 w-8 text-gray-300" />
                                                            ))}
                                                        </div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Nenhuma avaliação ainda</h4>
                                                        <p className="text-sm text-gray-500">
                                                            Seja o primeiro a avaliar este estabelecimento!
                                                        </p>
                                                    </div>
                                                ) : (
                                                    /* Reviews list */
                                                    reviews.map((review, index) => (
                                                        <div key={index} className="p-4 bg-white rounded-xl border">
                                                            <div className="flex items-start gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {review.nome?.charAt(0).toUpperCase() || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-semibold text-gray-900">{review.nome}</span>
                                                                        <span className="text-xs text-gray-400">{review.data}</span>
                                                                    </div>
                                                                    <div className="flex gap-0.5 mt-1">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star
                                                                                key={star}
                                                                                className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    {review.comentario && (
                                                                        <p className="text-sm text-gray-600 mt-2">{review.comentario}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )
                                })()}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    {/* Agendar Button */}
                    <BotaoAgendar
                        empresaSlug={slug}
                        empresaId={empresa.id}
                        empresaNome={empresa.nome}
                        servicos={empresa.servicos.map(s => ({
                            id: s.id,
                            nome: s.nome,
                            preco: Number(s.preco),
                            duracaoMin: s.duracaoMin
                        }))}
                        colaboradores={empresa.colaboradores.map(c => ({
                            id: c.id,
                            nome: c.nome,
                            foto: c.foto,
                            servicos: c.servicos
                        }))}
                        horariosColaborador={empresa.horariosColaborador.map(h => ({
                            diaSemana: h.diaSemana,
                            aberto: h.aberto,
                            horaAbertura: h.horaAbertura,
                            horaFechamento: h.horaFechamento,
                            colaboradorId: h.colaboradorId
                        }))}
                        horariosFuncionamento={empresa.horariosFuncionamento.map(h => ({
                            diaSemana: h.diaSemana,
                            aberto: h.aberto,
                            horaAbertura: h.horaAbertura,
                            horaFechamento: h.horaFechamento
                        }))}
                        agendamentosExistentes={empresa.agendamentos.map(a => ({
                            data: a.data,
                            colaboradorId: a.colaboradorId,
                            agendamento_itens: a.agendamento_itens
                        }))}
                        className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-xl h-12 font-semibold text-base shadow-lg"
                    />

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
                                                    {isOpen && horario?.horaAbertura && horario?.horaFechamento
                                                        ? `${horario.horaAbertura} - ${horario.horaFechamento}`
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
