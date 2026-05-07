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
        <Card className="group overflow-hidden rounded-[10px] border-dashboard-border bg-dashboard-surface py-0 shadow-[0_18px_50px_rgba(86,66,31,0.10)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
            <CardContent className="relative p-5 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-dashboard-primary/35" />
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-dashboard-primary/25 bg-dashboard-primary/10 text-dashboard-primary">
                        <Link2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-dashboard-foreground">
                        Link de Agendamento
                    </h3>
                </div>

                <div className="flex items-center gap-2 rounded-[10px] border border-dashboard-primary/30 bg-dashboard-surface-subtle p-2 pl-3">
                    <span className="flex-1 truncate text-sm font-medium text-dashboard-foreground">
                        {bookingUrl}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0 gap-2 rounded-[8px] bg-dashboard-surface-hover text-dashboard-muted hover:bg-dashboard-primary hover:text-dashboard-primary-foreground transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                <span>Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                <span>Copiar</span>
                            </>
                        )}
                    </Button>
                </div>

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-dashboard-muted">
                    Compartilhe para que clientes agendem.
                </p>
            </CardContent>
        </Card>
    )
}
