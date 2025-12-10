import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TopCollaborator {
    name: string
    count: number
}

interface TopCollaboratorsProps {
    collaborators: TopCollaborator[]
}

export function TopCollaborators({ collaborators }: TopCollaboratorsProps) {
    return (
        <Card className="col-span-3 lg:col-span-3">
            <CardHeader>
                <CardTitle>Top Colaboradores</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {collaborators.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Sem dados suficientes.
                        </p>
                    ) : (
                        collaborators.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {item.name[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.count} atendimentos
                                    </p>
                                </div>
                                <div className="ml-auto font-bold text-lg">
                                    #{index + 1}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
