import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ChevronRight,
    Users,
    User,
    MinusCircle,
    Smile,
    List,
    FileText,
    Gift
} from "lucide-react"
import Link from "next/link"

interface ReportCardProps {
    title: string
    description: string
    href: string
    icon?: React.ReactNode
    isNew?: boolean
}

function ReportCard({ title, description, href, icon, isNew }: ReportCardProps) {
    return (
        <Link href={href}>
            <div className="group relative flex h-full flex-col justify-between rounded-xl border bg-white p-6 transition-all hover:bg-gray-50 hover:shadow-sm">
                <div>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="text-gray-900">
                                    {icon}
                                </div>
                            )}
                            {isNew && (
                                <Badge className="bg-blue-600 hover:bg-blue-700">Novo</Badge>
                            )}
                        </div>
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-blue-600">
                        {title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:text-blue-600 group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    )
}

export default function RelatoriosPage() {
    const cards = [
        {
            title: "Relatório Financeiro",
            description: "Confira valores recebidos, despesas e dados sobre o seu negócio",
            href: "/dashboard/financeiro", // Assuming links to existing pages or placeholders
            isNew: true
        },
        {
            title: "Relatório de Atendimentos",
            description: "Confira os detalhes dos seus atendimentos, produtos, serviços e pacotes por período",
            href: "/dashboard/agendamentos", // Placeholder
            isNew: true
        },
        {
            title: "Relatório de Colaboradores",
            description: "Confira os colaboradores mais rentáveis para seu negócio.",
            href: "/dashboard/relatorios/colaboradores",
            icon: <Users className="h-6 w-6" />
        },
        {
            title: "Relatório de Clientes",
            description: "Confira os dados de seus clientes, como gasto médio e mais.",
            href: "/dashboard/clientes",
            icon: <User className="h-6 w-6" />
        },
        {
            title: "Relatório de Clientes Sumidos",
            description: "Confira os clientes sumidos e o tempo de ausência.",
            href: "/dashboard/relatorios/clientes-sumidos",
            icon: <MinusCircle className="h-6 w-6" />
        },
        {
            title: "Relatório de Clientes Ativos",
            description: "Confira os clientes que realizaram compras recentemente.",
            href: "/dashboard/clientes?filter=ativos",
            icon: <Smile className="h-6 w-6" />
        },
        {
            title: "Relatório de Serviços",
            description: "Dados sobre serviços, como serviços mais realizados no período, listagens e mais.",
            href: "/dashboard/relatorios/servicos",
            icon: <List className="h-6 w-6" />
        },
        {
            title: "Aniversariantes do Mês",
            description: "Lista de clientes que fazem aniversário no mês atual.",
            href: "/dashboard/relatorios/aniversariantes",
            icon: <Gift className="h-6 w-6" />
        }
    ]

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {cards.map((card, index) => (
                    <ReportCard
                        key={index}
                        title={card.title}
                        description={card.description}
                        href={card.href}
                        icon={card.icon}
                        isNew={card.isNew}
                    />
                ))}
            </div>
        </div>
    )
}
