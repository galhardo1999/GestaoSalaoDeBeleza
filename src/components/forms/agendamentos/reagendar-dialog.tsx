'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarClock } from "lucide-react"
import { reagendarAgendamento } from "@/actions/agendamentos"
import { format } from "date-fns"

interface ReagendarDialogProps {
    id: string
    currentDate: Date
}

export function ReagendarDialog({ id, currentDate }: ReagendarDialogProps) {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    const handleSave = () => {
        if (!date || !time) {
            setError("Selecione data e horário.")
            return
        }

        setError("")
        startTransition(async () => {
            const dateObj = new Date(`${date}T${time}`)
            if (dateObj.getTime() < Date.now()) {
                setError("A data deve ser no futuro.")
                return
            }

            const result = await reagendarAgendamento(id, dateObj)
            if (result.error) {
                setError(result.error)
            } else {
                setOpen(false)
                setDate("")
                setTime("")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    title="Reagendar"
                >
                    <CalendarClock className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reagendar Agendamento</DialogTitle>
                    <DialogDescription>
                        Escolha uma nova data e horário para este agendamento.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Data
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            className="col-span-3"
                            value={date}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                            Horário
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            className="col-span-3"
                            value={time}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
