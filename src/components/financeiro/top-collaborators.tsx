import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TopCollaboratorsProps {
    collaborators: { name: string; image: string | null; count: number }[]
    className?: string
}

export function TopCollaborators({ collaborators, className }: TopCollaboratorsProps) {
    return (
        <Card className={cn("col-span-3", className)}>
            <CardHeader>
                <CardTitle>Atendimentos por Colaborador</CardTitle>
                <CardDescription>
                    Colaboradores com mais atendimentos realizados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {collaborators.map((collaborator, index) => (
                        <div className="flex items-center" key={index}>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={collaborator.image || undefined} />
                                <AvatarFallback>{collaborator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{collaborator.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {index + 1}º lugar
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                {collaborator.count} atendimentos
                            </div>
                        </div>
                    ))}
                    {collaborators.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum atendimento realizado no período.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
