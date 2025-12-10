"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Calendar, Users, Scissors, LogOut, ListTodo, Settings } from "lucide-react"
import { signOut } from "next-auth/react"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Calendário",
        icon: Calendar,
        href: "/dashboard/calendario",
        color: "text-blue-500",
    },
    {
        label: "Agendamentos",
        icon: ListTodo, // Changed to differentiate from Calendar
        href: "/dashboard/agendamentos",
        color: "text-violet-500",
    },
    {
        label: "Clientes",
        icon: Users,
        href: "/dashboard/clientes",
        color: "text-pink-700",
    },
    {
        label: "Colaboradores",
        icon: Users, // Using same icon as clients for now, or could use another
        href: "/dashboard/colaboradores",
        color: "text-emerald-500",
    },
    {
        label: "Serviços",
        icon: Scissors,
        href: "/dashboard/servicos",
        color: "text-orange-700",
    },
    {
        label: "Configurações",
        icon: Settings,
        href: "/dashboard/configuracoes",
        color: "text-gray-500",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Gestão Salão
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full text-zinc-400 hover:text-white hover:bg-white/10 justify-start"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
