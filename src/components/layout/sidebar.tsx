"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutDashboard, Calendar, Users, Scissors, LogOut, ListTodo, Settings, Sparkles } from "lucide-react"
import { signOut } from "next-auth/react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Calendário",
        icon: Calendar,
        href: "/dashboard/calendario",
    },
    {
        label: "Agendamentos",
        icon: ListTodo,
        href: "/dashboard/agendamentos",
    },
    {
        label: "Clientes",
        icon: Users,
        href: "/dashboard/clientes",
    },
    {
        label: "Colaboradores",
        icon: Users,
        href: "/dashboard/colaboradores",
    },
    {
        label: "Serviços",
        icon: Scissors,
        href: "/dashboard/servicos",
    },
]

interface SidebarProps {
    isCollapsed: boolean
    toggleCollapse: () => void
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname()

    return (
        <TooltipProvider delayDuration={0}>
            <div className="space-y-4 py-4 flex flex-col h-full bg-white">
                <div className="px-3 py-2 flex-1 relative">
                    <div className="flex items-center mb-14 mt-4 px-2">
                        <Link href="/dashboard" className="flex items-center">
                            <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-blue-100 flex items-center justify-center mr-3 hover:opacity-80 transition">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                        Beleza
                                    </h1>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Gestão de Salão
                                    </p>
                                </div>
                            )}
                        </Link>

                        <Button
                            onClick={toggleCollapse}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute -right-3 top-2 h-7 w-7 rounded-full bg-white border shadow-sm hover:bg-gray-100 hidden md:flex",
                                isCollapsed ? "translate-x-1" : "-right-3"
                            )}
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Tooltip key={route.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                                            pathname === route.href
                                                ? "text-blue-600 bg-blue-50 font-semibold"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                            isCollapsed && "justify-center px-2"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-5 w-5",
                                                pathname === route.href ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                                                !isCollapsed && "mr-3"
                                            )} />
                                            {!isCollapsed && route.label}
                                        </div>
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right">
                                        {route.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                    </div>
                </div>

                <div className="px-3 py-2 mb-4 space-y-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/dashboard/configuracoes"
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                                    pathname === "/dashboard/configuracoes"
                                        ? "text-blue-600 bg-blue-50 font-semibold"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <Settings className={cn("h-5 w-5",
                                        pathname === "/dashboard/configuracoes" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                                        !isCollapsed && "mr-3"
                                    )} />
                                    {!isCollapsed && "Configurações"}
                                </div>
                            </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">
                                Configurações
                            </TooltipContent>
                        )}
                    </Tooltip>

                    <div className="h-[1px] bg-gray-100 w-full my-2" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => signOut()}
                                variant="ghost"
                                className={cn(
                                    "w-full text-gray-500 hover:text-red-500 hover:bg-red-50 justify-start rounded-xl p-3 h-auto",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                                {!isCollapsed && "Sair"}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">Sair</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}
