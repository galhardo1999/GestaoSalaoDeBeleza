"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CollaboratorPickerProps {
    collaborators: { id: string; nome: string }[]
}

export function CollaboratorPicker({ collaborators }: CollaboratorPickerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get current collaboratorId from URL or default to 'all'
    const currentCollaboratorId = searchParams.get("colaboradorId") || "all"

    const handleSelect = (value: string) => {
        const newValue = value

        const params = new URLSearchParams(searchParams.toString())

        if (newValue === "all") {
            params.delete("colaboradorId")
        } else {
            params.set("colaboradorId", newValue)
        }

        router.push(`/dashboard/financeiro?${params.toString()}`)
    }

    return (
        <Select value={currentCollaboratorId} onValueChange={handleSelect}>
            <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Todos colaboradores" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos colaboradores</SelectItem>
                {collaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                        {collaborator.nome}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
