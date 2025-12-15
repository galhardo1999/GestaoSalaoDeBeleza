import { Ticket } from "lucide-react"

export default function AdminPlanosPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full">
                <Ticket className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Planos</h2>
            <p className="text-gray-500 max-w-sm">
                Gerenciamento de planos em breve.
            </p>
        </div>
    )
}
