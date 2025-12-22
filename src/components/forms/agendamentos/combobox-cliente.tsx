"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface Cliente {
    id: string
    nome: string
}

interface ComboboxClienteProps {
    clientes: Cliente[]
    onSelect: (id: string) => void
    initialValue?: string
}

export function ComboboxCliente({ clientes, onSelect, initialValue }: ComboboxClienteProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(initialValue || "")
    const [search, setSearch] = React.useState("")

    const filteredClientes = React.useMemo(() => {
        if (!search) return clientes
        return clientes.filter((cliente) =>
            cliente.nome.toLowerCase().includes(search.toLowerCase())
        )
    }, [clientes, search])

    const selectedCliente = clientes.find((cliente) => cliente.id === value)

    return (
        <div className="w-full">
            {/* Hidden input to ensure form submission works if strictly required, 
            but for server actions we usually pass the ID via a hidden input in the parent or here */}
            <input type="hidden" name="clienteId" value={value} />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                    >
                        {selectedCliente ? selectedCliente.nome : "Selecione um cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 border-none focus-visible:ring-0 shadow-none h-9"
                            />
                        </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filteredClientes.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum cliente encontrado.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredClientes.map((cliente) => (
                                    <div
                                        key={cliente.id}
                                        onClick={() => {
                                            setValue(cliente.id)
                                            onSelect(cliente.id)
                                            setOpen(false)
                                            setSearch("") // Reset search on select
                                        }}
                                        className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                                            value === cliente.id ? "bg-accent text-accent-foreground" : ""
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === cliente.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {cliente.nome}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
