"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
    phone: string
    clientName: string
    date: Date
    serviceName: string
    messageTemplate?: string | null
}

export function WhatsAppButton({ phone, clientName, date, serviceName, messageTemplate }: WhatsAppButtonProps) {
    const handleSend = () => {
        if (!phone) {
            alert("Cliente sem telefone cadastrado.")
            return
        }

        // Remove non-digits
        const cleanPhone = phone.replace(/\D/g, "")
        // Assume BR +55 if generic length (10 or 11 digits: DD + Number)
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone

        // Default template if none provided
        let message = messageTemplate || "Olá {cliente}, confirmamos seu agendamento de {servico} para o dia {data} às {hora}."

        // Simple manual formatting to avoid heavy date-fns dependency in client component if not needed, 
        // but since we receive a Date object, standard methods work.
        // Adjust for timezone? The Date object passed from server component (serialized) comes as string usually if not careful?
        // In Next.js Server Actions/Components, Dates are passed as Date objects if using standard props, 
        // but over network boundary effectively strings. 
        // However, if we receive it as Date check:
        const d = new Date(date)

        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const year = d.getFullYear()
        const hours = d.getHours().toString().padStart(2, '0')
        const minutes = d.getMinutes().toString().padStart(2, '0')

        const dateStr = `${day}/${month}/${year}`
        const timeStr = `${hours}:${minutes}`

        message = message.replace(/{cliente}/gi, clientName)
        message = message.replace(/{servico}/gi, serviceName)
        message = message.replace(/{data}/gi, dateStr)
        message = message.replace(/{hora}/gi, timeStr)

        const encoded = encodeURIComponent(message)
        window.open(`https://wa.me/${finalPhone}?text=${encoded}`, '_blank')
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleSend} title="Enviar WhatsApp" className="h-8 w-8 hover:bg-green-50 hover:text-green-600">
            <MessageCircle className="h-4 w-4" />
        </Button>
    )
}
