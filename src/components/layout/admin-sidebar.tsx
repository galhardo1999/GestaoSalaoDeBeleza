"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LayoutDashboard, Building2, Ticket, LogOut, Settings, ShieldCheck, Monitor } from "lucide-react"
import { signOut } from "next-auth/react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const routes = [
    {
        label: "Início",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        label: "Empresas",
        icon: Building2,
        href: "/admin/empresas",
    },
    {
        label: "Planos",
        icon: Ticket,
        href: "/admin/planos",
    },
]

interface AdminSidebarProps {
    isCollapsed: boolean
    toggleCollapse: () => void
}

export function AdminSidebar({ isCollapsed, toggleCollapse }: AdminSidebarProps) {
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
                        <Link href="/admin" className="flex items-center overflow-hidden mb-4">
                            <div className="h-12 w-12 min-w-[3rem] rounded-2xl bg-slate-900 flex items-center justify-center mr-3 hover:opacity-80 transition shrink-0">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
                                    <h1 className="text-xl font-bold text-gray-900 leading-none mb-1">
                                        Admin
                                    </h1>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Gestão Global
                                    </p>
                                </div>
                            )}
                        </Link>
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
                                            pathname === route.href || (route.href !== "/admin" && pathname.startsWith(route.href))
                                                ? "text-slate-900 bg-slate-100 font-semibold"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                            isCollapsed && "justify-center px-2"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-110",
                                                pathname === route.href || (route.href !== "/admin" && pathname.startsWith(route.href)) ? "text-slate-900" : "text-gray-400 group-hover:text-gray-500",
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
                            <Link href="/dashboard" className="w-full">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full group text-gray-500 hover:text-blue-600 hover:bg-blue-50 justify-start rounded-xl p-3 h-auto",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <Monitor className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", !isCollapsed && "mr-3")} />
                                    {!isCollapsed && "Sistema"}
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">Sistema</TooltipContent>}
                    </Tooltip>

                    <div className="h-[1px] bg-gray-100 w-full my-2" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => signOut({ redirect: false }).then(() => { window.location.href = "/login" })}
                                variant="ghost"
                                className={cn(
                                    "w-full group text-gray-500 hover:text-red-500 hover:bg-red-50 justify-start rounded-xl p-3 h-auto",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <LogOut className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", !isCollapsed && "mr-3")} />
                                <span className={cn(isCollapsed && "hidden")}>Sair</span>
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">Sair</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}
