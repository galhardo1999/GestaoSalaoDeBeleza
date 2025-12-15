import { Construction } from "lucide-react"

export default function EstatisticasPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
            <div className="bg-purple-50 p-6 rounded-full">
                <Construction className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Estatísticas e Relatórios</h1>
            <p className="text-gray-500 max-w-md">
                Este módulo está em desenvolvimento. Em breve você terá acesso a gráficos detalhados sobre desempenho, retenção e faturamento.
            </p>
        </div>
    )
}
