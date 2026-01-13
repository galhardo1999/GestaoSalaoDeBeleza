"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface BookingLinkCardProps {
    empresaSlug: string
}

export function BookingLinkCard({ empresaSlug }: BookingLinkCardProps) {
    const [copied, setCopied] = useState(false)

    // Build the booking URL based on the current domain and company slug
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const bookingUrl = `${baseUrl}/agendar/${empresaSlug}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(bookingUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <Card className="bg-white">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Link2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Seu Link de Agendamento
                    </h3>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <span className="flex-1 text-sm text-gray-600 truncate">
                        {bookingUrl}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0 gap-2 rounded-lg border-gray-200 bg-white hover:bg-gray-50"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                <span>Copiar</span>
                            </>
                        )}
                    </Button>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                    Compartilhe este link com seus clientes para que possam agendar serviços diretamente.
                </p>
            </CardContent>
        </Card>
    )
}
