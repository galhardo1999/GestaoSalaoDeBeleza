"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutDashboard, Calendar, Users, Scissors, LogOut, ListTodo, Settings, Sparkles, UserCog, Wallet, BarChart3, ChevronDown, Percent, PieChart, Folder } from "lucide-react"
import { signOut } from "next-auth/react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

interface RouteItem {
    label: string
    icon: any
    href: string
    active?: boolean
    submenus?: RouteItem[]
}

const routes: RouteItem[] = [
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
        label: "Cadastros",
        icon: Folder,
        href: "/dashboard/cadastros",
        submenus: [
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
    },
    {
        label: "Financeiro",
        icon: Wallet,
        href: "/dashboard/financeiro",
        submenus: [
            {
                label: "Visão Geral",
                href: "/dashboard/financeiro",
                icon: PieChart
            },
            {
                label: "Comissões",
                href: "/dashboard/financeiro/comissao",
                icon: Percent
            }
        ]
    },
    {
        label: "Estatísticas",
        icon: BarChart3,
        href: "/dashboard/estatisticas",
    },
]

interface SidebarProps {
    isCollapsed: boolean
    toggleCollapse: () => void
    companyName?: string
    companyCnpj?: string
    userName?: string
}

export function Sidebar({ isCollapsed, toggleCollapse, companyName, companyCnpj, userName }: SidebarProps) {
    const pathname = usePathname()
    // State to track open collapsibles, could be based on current path
    const [openMenus, setOpenMenus] = useState<string[]>([])

    // Automatically open menu if submenu is active
    useEffect(() => {
        const activeRoute = routes.find(r => r.submenus?.some(sub => pathname === sub.href))
        if (activeRoute && !openMenus.includes(activeRoute.label)) {
            setOpenMenus(prev => [...prev, activeRoute.label])
        }
    }, [pathname])

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        )
    }

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
                    <div className="mb-2">
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
                                {userName && (
                                    <p className="text-xs text-gray-500 mt-1 font-medium truncate" title={userName}>
                                        Usuário: {userName}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full mb-6" />

                    <div className="space-y-1.5">
                        {routes.map((route) => {
                            const isActive = pathname === route.href || route.submenus?.some(s => pathname === s.href)

                            if (route.submenus) {
                                if (isCollapsed) {
                                    // Collapsed mode: Dropdown
                                    return (
                                        <DropdownMenu key={route.href}>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full h-auto p-3.5 justify-center rounded-2xl group",
                                                        isActive ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                                        "px-2"
                                                    )}
                                                >
                                                    <div className="flex items-center flex-1">
                                                        <route.icon className={cn("h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-110",
                                                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                                                        )} />
                                                    </div>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" align="start" sideOffset={20} className="w-48 ml-2">
                                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                                                    {route.label}
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator className="-mx-1 my-1" />
                                                {route.submenus.map(sub => {
                                                    const isSubActive = pathname === sub.href
                                                    return (
                                                        <DropdownMenuItem key={sub.href} asChild className="p-0 focus:bg-transparent">
                                                            <Link
                                                                href={sub.href}
                                                                className={cn(
                                                                    "flex items-center w-full px-2 py-1.5 mx-1 my-0.5 rounded-md text-sm transition-colors cursor-pointer",
                                                                    isSubActive
                                                                        ? "bg-blue-50 text-blue-600 font-medium"
                                                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                                )}
                                                            >
                                                                <sub.icon className={cn("mr-2 h-4 w-4", isSubActive ? "text-blue-600" : "text-gray-400")} />
                                                                {sub.label}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                }

                                // Expanded mode: Collapsible
                                const isOpen = openMenus.includes(route.label)
                                return (
                                    <Collapsible
                                        key={route.href}
                                        open={isOpen}
                                        onOpenChange={() => toggleMenu(route.label)}
                                        className="w-full"
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full p-3.5 justify-between font-medium rounded-2xl h-auto transition-all duration-200 ease-in-out group text-sm",
                                                    isActive
                                                        ? "text-blue-600 bg-blue-50 font-semibold"
                                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                                )}
                                            >
                                                <div className="flex items-center">
                                                    <route.icon className={cn("h-[22px] w-[22px] mr-3.5 transition-transform duration-200 group-hover:scale-110",
                                                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                                                    )} />
                                                    {route.label}
                                                </div>
                                                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="pl-4 space-y-1">
                                            {route.submenus.map(sub => {
                                                const isSubActive = pathname === sub.href
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={cn(
                                                            "flex items-center p-2 rounded-xl text-sm transition-colors",
                                                            isSubActive
                                                                ? "text-blue-600 bg-blue-50/50 font-medium"
                                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <sub.icon className={cn("h-4 w-4 mr-3", isSubActive ? "text-blue-600" : "text-gray-400")} />
                                                        {sub.label}
                                                    </Link>
                                                )
                                            })}
                                        </CollapsibleContent>
                                    </Collapsible>
                                )
                            }

                            return (
                                <Tooltip key={route.href}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={route.href}
                                            className={cn(
                                                "text-sm group flex p-3.5 w-full justify-start font-medium cursor-pointer rounded-2xl transition-all duration-200 ease-in-out",
                                                isActive
                                                    ? "text-blue-600 bg-blue-50 font-semibold"
                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                                isCollapsed && "justify-center px-2"
                                            )}
                                        >
                                            <div className="flex items-center flex-1">
                                                <route.icon className={cn("h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-110",
                                                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
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
                            )
                        })}
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
