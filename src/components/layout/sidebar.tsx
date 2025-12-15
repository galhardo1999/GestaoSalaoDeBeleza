"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutDashboard, Calendar, Users, Scissors, LogOut, ListTodo, Settings, Sparkles, UserCog } from "lucide-react"
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
        icon: UserCog,
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
    companyName?: string
    companyCnpj?: string
}

export function Sidebar({ isCollapsed, toggleCollapse, companyName, companyCnpj }: SidebarProps) {
    const pathname = usePathname()

    return (
        <TooltipProvider delayDuration={0}>
            <div className="space-y-4 py-4 flex flex-col h-full bg-white relative">
                <Button
                    onClick={toggleCollapse}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute -right-3 top-6 h-8 w-8 rounded-full bg-white border shadow-sm hover:bg-gray-50 z-20 hidden md:flex items-center justify-center",
                        isCollapsed ? "translate-x-1" : ""
                    )}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
                </Button>

                <div className="px-4 py-2 flex-1 relative">
                    <div className="mb-8">
                        <Link href="/dashboard" className="flex items-center overflow-hidden mb-4">
                            <div className="h-12 w-12 min-w-[3rem] rounded-2xl bg-blue-50 flex items-center justify-center mr-3 hover:opacity-80 transition shrink-0">
                                <Sparkles className="h-6 w-6 text-blue-600" />
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                                    <h1 className="text-2xl font-bold text-gray-900 leading-none mb-1">
                                        Beleza
                                    </h1>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Gestão de Salão
                                    </p>
                                </div>
                            )}
                        </Link>

                        {!isCollapsed && (companyName || companyCnpj) && (
                            <div className="pl-1 animate-in fade-in duration-300 selection:bg-none">
                                {companyName && (
                                    <p className="text-sm font-bold text-gray-900 truncate" title={companyName}>
                                        {companyName}
                                    </p>
                                )}
                                {companyCnpj && (
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {companyCnpj.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full mb-6" />

                    <div className="space-y-1.5">
                        {routes.map((route) => (
                            <Tooltip key={route.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            "text-sm group flex p-3.5 w-full justify-start font-medium cursor-pointer rounded-2xl transition-all duration-200 ease-in-out",
                                            pathname === route.href
                                                ? "text-blue-600 bg-blue-50 font-semibold"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                            isCollapsed && "justify-center px-2"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-110",
                                                pathname === route.href ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                                                !isCollapsed && "mr-3.5"
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

                <div className="px-4 py-2 mb-4 space-y-1.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/dashboard/configuracoes"
                                className={cn(
                                    "text-sm group flex p-3.5 w-full justify-start font-medium cursor-pointer rounded-2xl transition-all duration-200",
                                    pathname === "/dashboard/configuracoes"
                                        ? "text-blue-600 bg-blue-50 font-semibold"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <Settings className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110",
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
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                variant="ghost"
                                className={cn(
                                    "w-full group text-gray-500 hover:text-red-500 hover:bg-red-50 justify-start rounded-xl p-3 h-auto",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <LogOut className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", !isCollapsed && "mr-3")} />
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
