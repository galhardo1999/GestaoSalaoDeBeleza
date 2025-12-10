import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopService {
    serviceName: string
    count: number
}

interface TopServicesProps {
    services: TopService[]
}

export function TopServices({ services }: TopServicesProps) {
    return (
        <Card className="col-span-3 lg:col-span-4">
            <CardHeader>
                <CardTitle>Serviços Mais Realizados</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {services.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Sem dados suficientes.
                        </p>
                    ) : (
                        services.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-8 font-bold text-muted-foreground">
                                    #{index + 1}
                                </div>
                                <div className="ml-2 space-y-1 flex-1">
                                    <p className="text-sm font-medium leading-none">{item.serviceName}</p>
                                    <div className="w-full bg-secondary h-2 rounded-full mt-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                                width: `${(item.count / Math.max(...services.map(s => s.count))) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="ml-auto font-medium text-sm pl-4">
                                    {item.count}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
