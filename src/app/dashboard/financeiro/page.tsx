import { Construction } from "lucide-react"

export default function FinanceiroPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
            <div className="bg-blue-50 p-6 rounded-full">
                <Construction className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Módulo Financeiro</h1>
            <p className="text-gray-500 max-w-md">
                Este módulo está em desenvolvimento. Em breve você poderá gerenciar receitas, despesas e fluxo de caixa por aqui.
            </p>
        </div>
    )
}
