"use client"

import { Building2 } from "lucide-react"

export function SelectCompanyState() {
    return (
        <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50">
            <div className="rounded-full bg-blue-50 p-4">
                <Building2 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">Nenhuma empresa selecionada</h3>
                <p className="text-sm text-gray-500 max-w-[300px]">
                    Para gerenciar clientes, agendamentos e outros recursos, selecione uma empresa no menu lateral.
                </p>
            </div>
        </div>
    )
}
