"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    FileText,
    Folder,
    LayoutDashboard,
    ListTodo,
    Loader2,
    LogOut,
    Percent,
    PieChart,
    Scissors,
    Settings,
    UserCog,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react"
import { getCompaniesForSwitcher, switchCompany } from "@/actions/super-admin"
import { Button } from "@/components/ui/button"
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type RotaMenu = {
    label: string
    icon: LucideIcon
    href: string
    submenus?: RotaMenu[]
}

const rotas: RotaMenu[] = [
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
        ],
    },
    {
        label: "Financeiro",
        icon: Wallet,
        href: "/dashboard/financeiro",
        submenus: [
            {
                label: "Visão Geral",
                href: "/dashboard/financeiro",
                icon: PieChart,
            },
            {
                label: "Comissões",
                href: "/dashboard/financeiro/comissao",
                icon: Percent,
            },
        ],
    },
    {
        label: "Relatórios",
        icon: FileText,
        href: "/dashboard/relatorios",
    },
]

type EmpresaSwitcher = {
    value: string
    label: string
    cnpj: string
}

type SidebarProps = {
    isCollapsed: boolean
    toggleCollapse: () => void
    companyName?: string
    companyCnpj?: string
    userName?: string
    userCargo?: string
}

const formatarCnpj = (cnpj: string) =>
    cnpj.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")

export function Sidebar({ isCollapsed, toggleCollapse, companyName, companyCnpj, userName, userCargo }: SidebarProps) {
    const pathname = usePathname()
    const [menusAbertos, setMenusAbertos] = useState<string[]>([])
    const [empresas, setEmpresas] = useState<EmpresaSwitcher[]>([])
    const [carregandoEmpresas, setCarregandoEmpresas] = useState(false)
    const [switcherAberto, setSwitcherAberto] = useState(false)

    useEffect(() => {
        const menusAtivos = rotas
            .filter((rota) => rota.submenus?.some((submenu) => pathname === submenu.href))
            .map((rota) => rota.label)

        if (menusAtivos.length > 0) {
            setMenusAbertos((menusAtuais) => Array.from(new Set([...menusAtuais, ...menusAtivos])))
        }
    }, [pathname])

    useEffect(() => {
        if (userCargo !== "SUPER_ADMIN") {
            return
        }

        const carregarEmpresas = async () => {
            setCarregandoEmpresas(true)
            try {
                const dados = await getCompaniesForSwitcher()
                setEmpresas(dados)
            } catch (erro) {
                console.error("Falha ao carregar empresas", erro)
            } finally {
                setCarregandoEmpresas(false)
            }
        }

        carregarEmpresas()
    }, [userCargo])

    const trocarEmpresa = async (empresaId: string) => {
        try {
            await switchCompany(empresaId)
            window.location.reload()
        } catch (erro) {
            console.error("Falha ao trocar de empresa", erro)
            alert("Erro ao trocar de empresa")
        }
    }

    const alternarMenu = (label: string) => {
        setMenusAbertos((menusAtuais) =>
            menusAtuais.includes(label)
                ? menusAtuais.filter((menu) => menu !== label)
                : [...menusAtuais, label]
        )
    }

    const classeItemMenu = (ativo: boolean) =>
        cn(
            "group relative flex w-full items-center rounded-[8px] px-3.5 py-3 text-sm font-medium transition-colors",
            ativo
                ? "bg-[#D4AF37]/10 text-[#F5F0E8]"
                : "text-[#A9A198] hover:bg-[#171717] hover:text-[#F5F0E8]",
            isCollapsed && "justify-center px-2"
        )

    const classeIconeMenu = (ativo: boolean, comMargem = true) =>
        cn(
            "h-5 w-5 transition-colors",
            ativo ? "text-[#D4AF37]" : "text-[#756C62] group-hover:text-[#D4AF37]",
            comMargem && !isCollapsed && "mr-3.5"
        )

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-full flex-col border-r border-[#2A2418] bg-[#0F0F0F] py-5 text-[#F5F0E8]">
                <Button
                    onClick={toggleCollapse}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute -right-3 top-7 z-20 hidden h-8 w-8 items-center justify-center rounded-[8px] border border-[#3A301C] bg-[#141414] text-[#C9A84C] shadow-[0_10px_25px_rgba(0,0,0,0.35)] hover:border-[#D4AF37]/60 hover:bg-[#191919] md:flex",
                        isCollapsed ? "translate-x-1" : ""
                    )}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>

                <div className="relative flex-1 overflow-y-auto px-4">
                    <Link href="/dashboard" className="mb-7 flex items-center overflow-hidden">
                        <div className="mr-3 flex h-12 w-12 min-w-[3rem] shrink-0 items-center justify-center rounded-[10px] border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_12px_28px_rgba(212,175,55,0.08)] transition-colors hover:border-[#D4AF37]/60">
                            <Scissors className="h-6 w-6" />
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden whitespace-nowrap transition-all duration-300">
                                <h1 className="font-heading text-[1.35rem] font-semibold leading-none tracking-normal text-[#F5F0E8]">
                                    BARBER & CO.
                                </h1>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C9A84C]">
                                    Gestão Premium
                                </p>
                            </div>
                        )}
                    </Link>

                    {!isCollapsed && (
                        <div className="mb-5 animate-in fade-in duration-300">
                            {userCargo === "SUPER_ADMIN" ? (
                                <DropdownMenu open={switcherAberto} onOpenChange={setSwitcherAberto}>
                                    <DropdownMenuTrigger asChild>
                                        <button className="group w-full cursor-pointer rounded-[10px] border border-[#2A2418] bg-[#151515] p-3 text-left transition-colors hover:border-[#D4AF37]/35 hover:bg-[#181818]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    {companyName ? (
                                                        <>
                                                            <p className="truncate text-sm font-semibold text-[#F5F0E8]" title={companyName}>
                                                                {companyName}
                                                            </p>
                                                            {companyCnpj && (
                                                                <p className="mt-1 text-xs text-[#A9A198]">
                                                                    {formatarCnpj(companyCnpj)}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-sm font-semibold text-[#D4AF37]">
                                                            Selecionar Empresa
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#7D756C] group-hover:text-[#D4AF37]" />
                                            </div>
                                            {userName && (
                                                <p className="mt-3 truncate border-t border-[#2A2418] pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C8379]" title={userName}>
                                                    {userCargo === "SUPER_ADMIN" ? "Administrador" : userName}
                                                </p>
                                            )}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="max-h-[300px] w-64 overflow-y-auto border-[#2A2418] bg-[#151515] text-[#F5F0E8] shadow-[0_24px_70px_rgba(0,0,0,0.55)]" align="start">
                                        <DropdownMenuLabel className="font-heading text-[#C9A84C]">Trocar Empresa</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-[#2A2418]" />
                                        {carregandoEmpresas ? (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                                            </div>
                                        ) : (
                                            empresas.map((empresa) => (
                                                <DropdownMenuItem
                                                    key={empresa.value}
                                                    onSelect={() => trocarEmpresa(empresa.value)}
                                                    className="flex cursor-pointer flex-col items-start gap-1 focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]"
                                                >
                                                    <span className="font-medium">{empresa.label}</span>
                                                    <span className="text-xs text-[#A9A198]">{formatarCnpj(empresa.cnpj)}</span>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (companyName || companyCnpj) ? (
                                <div className="rounded-[10px] border border-[#2A2418] bg-[#151515] p-3">
                                    {companyName && (
                                        <p className="truncate text-sm font-semibold text-[#F5F0E8]" title={companyName}>
                                            {companyName}
                                        </p>
                                    )}
                                    {companyCnpj && (
                                        <p className="mt-1 text-xs text-[#A9A198]">
                                            {formatarCnpj(companyCnpj)}
                                        </p>
                                    )}
                                    {userName && (
                                        <p className="mt-3 truncate border-t border-[#2A2418] pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C8379]" title={userName}>
                                            {userCargo === "SUPER_ADMIN" ? "Administrador" : userName}
                                        </p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="mb-4 h-px w-full bg-[#2A2418]" />
                    {!isCollapsed && (
                        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#71685F]">
                            Operação
                        </p>
                    )}

                    <div className="space-y-1.5">
                        {rotas.map((rota) => {
                            const ativo = pathname === rota.href || Boolean(rota.submenus?.some((submenu) => pathname === submenu.href))

                            if (rota.submenus) {
                                if (isCollapsed) {
                                    return (
                                        <DropdownMenu key={rota.href}>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className={classeItemMenu(ativo)}
                                                >
                                                    {ativo && <span className="absolute left-0 top-2 h-7 w-[2px] rounded-r-full bg-[#D4AF37]" />}
                                                    <rota.icon className={classeIconeMenu(ativo, false)} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" align="start" sideOffset={18} className="ml-2 w-52 border-[#2A2418] bg-[#151515] text-[#F5F0E8] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
                                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A84C]">
                                                    {rota.label}
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator className="-mx-1 my-1 bg-[#2A2418]" />
                                                {rota.submenus.map((submenu) => {
                                                    const submenuAtivo = pathname === submenu.href

                                                    return (
                                                        <DropdownMenuItem key={submenu.href} asChild className="p-0 focus:bg-transparent">
                                                            <Link
                                                                href={submenu.href}
                                                                className={cn(
                                                                    "mx-1 my-0.5 flex w-full items-center rounded-[7px] px-2 py-2 text-sm transition-colors",
                                                                    submenuAtivo
                                                                        ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                                                                        : "text-[#A9A198] hover:bg-[#1B1B1B] hover:text-[#F5F0E8]"
                                                                )}
                                                            >
                                                                <submenu.icon className={cn("mr-2 h-4 w-4", submenuAtivo ? "text-[#D4AF37]" : "text-[#756C62]")} />
                                                                {submenu.label}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                }

                                const aberto = menusAbertos.includes(rota.label)

                                return (
                                    <Collapsible
                                        key={rota.href}
                                        open={aberto}
                                        onOpenChange={() => alternarMenu(rota.label)}
                                        className="w-full"
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={cn(classeItemMenu(ativo), "justify-between")}
                                            >
                                                {ativo && <span className="absolute left-0 top-2 h-7 w-[2px] rounded-r-full bg-[#D4AF37]" />}
                                                <div className="flex items-center">
                                                    <rota.icon className={classeIconeMenu(ativo)} />
                                                    {rota.label}
                                                </div>
                                                <ChevronDown className={cn("h-4 w-4 text-[#756C62] transition-transform duration-200", aberto && "rotate-180 text-[#D4AF37]")} />
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="relative space-y-1 pt-2 pl-5 before:absolute before:bottom-2 before:left-6 before:top-2 before:w-px before:bg-[#2A2418]">
                                            {rota.submenus.map((submenu) => {
                                                const submenuAtivo = pathname === submenu.href

                                                return (
                                                    <Link
                                                        key={submenu.href}
                                                        href={submenu.href}
                                                        className={cn(
                                                            "relative z-10 ml-5 flex items-center rounded-[7px] px-3 py-2 text-sm transition-colors",
                                                            submenuAtivo
                                                                ? "bg-[#D4AF37]/10 font-semibold text-[#D4AF37]"
                                                                : "text-[#8C8379] hover:bg-[#171717] hover:text-[#F5F0E8]"
                                                        )}
                                                    >
                                                        <submenu.icon className={cn("mr-3 h-4 w-4", submenuAtivo ? "text-[#D4AF37]" : "text-[#756C62]")} />
                                                        {submenu.label}
                                                    </Link>
                                                )
                                            })}
                                        </CollapsibleContent>
                                    </Collapsible>
                                )
                            }

                            return (
                                <Tooltip key={rota.href}>
                                    <TooltipTrigger asChild>
                                        <Link href={rota.href} className={classeItemMenu(ativo)}>
                                            {ativo && <span className="absolute left-0 top-2 h-7 w-[2px] rounded-r-full bg-[#D4AF37]" />}
                                            <div className="flex items-center">
                                                <rota.icon className={classeIconeMenu(ativo)} />
                                                {!isCollapsed && rota.label}
                                            </div>
                                        </Link>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right" className="border-[#2A2418] bg-[#151515] text-[#F5F0E8]">
                                            {rota.label}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            )
                        })}
                    </div>
                </div>

                <div className="px-4 pt-4">
                    {!isCollapsed && (
                        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#71685F]">
                            Sistema
                        </p>
                    )}
                    <div className="space-y-1.5 border-t border-[#2A2418] pt-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/dashboard/configuracoes"
                                    className={classeItemMenu(pathname === "/dashboard/configuracoes")}
                                >
                                    {pathname === "/dashboard/configuracoes" && <span className="absolute left-0 top-2 h-7 w-[2px] rounded-r-full bg-[#D4AF37]" />}
                                    <div className="flex items-center">
                                        <Settings className={classeIconeMenu(pathname === "/dashboard/configuracoes")} />
                                        {!isCollapsed && "Configurações"}
                                    </div>
                                </Link>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right" className="border-[#2A2418] bg-[#151515] text-[#F5F0E8]">
                                    Configurações
                                </TooltipContent>
                            )}
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => signOut({ redirect: false }).then(() => { window.location.href = "/login" })}
                                    variant="ghost"
                                    className={cn(
                                        "group flex h-auto w-full items-center rounded-[8px] px-3.5 py-3 text-sm font-medium text-[#A9A198] transition-colors hover:bg-red-500/10 hover:text-red-300",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <LogOut className={cn("h-5 w-5 text-[#756C62] transition-colors group-hover:text-red-300", !isCollapsed && "mr-3.5")} />
                                    {!isCollapsed && "Sair"}
                                </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right" className="border-[#2A2418] bg-[#151515] text-[#F5F0E8]">
                                    Sair
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
