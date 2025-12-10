"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface PaginationControlProps {
    currentPage: number
    totalPages: number
    baseUrl: string // e.g., "/dashboard/agendamentos"
}

export function PaginationControl({ currentPage, totalPages, baseUrl }: PaginationControlProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const onPageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`${baseUrl}?${params.toString()}`)
    }

    // if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
                Anterior
            </Button>
            <div className="text-sm font-medium">
                Página {currentPage} de {totalPages}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                Próxima
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
