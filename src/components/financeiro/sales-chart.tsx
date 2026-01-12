"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import { cn } from "@/lib/utils"

interface SalesChartProps {
    data: {
        name: string;
        receita: number;
        details: { name: string; value: number }[]
    }[]
    className?: string
}

export function SalesChart({ data, className }: SalesChartProps) {
    return (
        <Card className={cn("col-span-4", className)}>
            <CardHeader>
                <CardTitle>Visão Geral de Receita</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="receita"
                            fill="#16a34a"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
                <p className="font-bold mb-2 text-gray-900 border-b pb-1">{label}</p>
                {data.details && data.details.length > 0 ? (
                    <div className="space-y-1 mb-2">
                        {data.details.map((detail: any, index: number) => (
                            <div key={index} className="flex justify-between gap-4 text-xs">
                                <span className="text-gray-600">{detail.name}:</span>
                                <span className="font-medium text-gray-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(detail.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 mb-2">Sem serviços registrados</p>
                )}
                <div className="border-t pt-1 flex justify-between gap-4 font-bold text-green-600">
                    <span>Total:</span>
                    <span>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
                    </span>
                </div>
            </div>
        )
    }

    return null
}
