import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface TopServicesProps {
    services: { name: string; count: number; revenue: number }[]
}

export function TopServices({ services }: TopServicesProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Top Serviços</CardTitle>
                <CardDescription>
                    Serviços com maior arrecadação no período.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {services.map((service, index) => (
                        <div className="flex items-center" key={index}>
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{index + 1}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{service.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {service.count} realizados
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(service.revenue)}
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum serviço realizado no período.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
