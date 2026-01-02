"use client"

import { useState, ReactNode, ComponentType } from "react"
import { cn } from "@/lib/utils"

interface SidebarProps {
    isCollapsed: boolean
    toggleCollapse: () => void
}

interface ShellProps {
    /** Conteúdo principal */
    children: ReactNode
    /** Componente de sidebar a ser renderizado */
    Sidebar: ComponentType<SidebarProps & Record<string, unknown>>
    /** Props adicionais para o sidebar */
    sidebarProps?: Record<string, unknown>
    /** Variante do shell */
    variant?: 'dashboard' | 'admin'
    /** Largura da sidebar quando expandida */
    expandedWidth?: string
    /** Largura da sidebar quando colapsada */
    collapsedWidth?: string
    /** Se true, adiciona padding ao conteúdo */
    withPadding?: boolean
    /** Classes CSS adicionais para o container */
    className?: string
    /** Classes CSS adicionais para o main */
    mainClassName?: string
}

/**
 * Componente Shell unificado para layouts com sidebar.
 * Substitui DashboardShell e AdminShell com uma implementação flexível.
 * 
 * @example
 * ```tsx
 * // Dashboard Shell
 * <Shell
 *   Sidebar={Sidebar}
 *   sidebarProps={{ companyName, companyCnpj, userName, userCargo }}
 *   variant="dashboard"
 * >
 *   {children}
 * </Shell>
 * 
 * // Admin Shell
 * <Shell
 *   Sidebar={AdminSidebar}
 *   variant="admin"
 *   withPadding
 * >
 *   {children}
 * </Shell>
 * ```
 */
export function Shell({
    children,
    Sidebar,
    sidebarProps = {},
    variant = 'dashboard',
    expandedWidth = '256px', // 64 * 4 = 256px (w-64)
    collapsedWidth = '80px', // 20 * 4 = 80px (w-20)
    withPadding = false,
    className,
    mainClassName,
}: ShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleCollapse = () => setIsCollapsed(!isCollapsed)

    const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth

    // Variantes de estilo
    const containerStyles = {
        dashboard: 'h-full relative bg-gray-50',
        admin: 'flex h-screen bg-gray-50 overflow-hidden',
    }

    const sidebarContainerStyles = {
        dashboard: cn(
            'hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 bg-white border-r'
        ),
        admin: cn(
            'bg-white border-r border-gray-200 shadow-sm relative z-30 transition-all duration-300 ease-in-out hidden md:flex flex-col'
        ),
    }

    const mainStyles = {
        dashboard: 'min-h-screen transition-all duration-300',
        admin: 'flex-1 overflow-auto w-full relative z-0',
    }

    return (
        <div className={cn(containerStyles[variant], className)}>
            {/* Sidebar Container */}
            <div
                className={sidebarContainerStyles[variant]}
                style={{ width: sidebarWidth }}
            >
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                    {...sidebarProps}
                />
            </div>

            {/* Main Content */}
            <main
                className={cn(mainStyles[variant], mainClassName)}
                style={variant === 'dashboard' ? { paddingLeft: sidebarWidth } : undefined}
            >
                {withPadding ? (
                    <div className="container mx-auto p-8 max-w-7xl animate-in fade-in duration-500">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </main>
        </div>
    )
}

// ============================================
// Componentes de conveniência para retrocompatibilidade
// ============================================

import { Sidebar } from "./sidebar"
import { AdminSidebar } from "./admin-sidebar"

interface DashboardShellProps {
    children: ReactNode
    companyName?: string
    companyCnpj?: string
    userName?: string
    userCargo?: string
}

/**
 * Shell do Dashboard - wrapper de conveniência para o Shell unificado.
 * Mantido para retrocompatibilidade.
 * 
 * @deprecated Use o componente Shell diretamente para maior flexibilidade
 */
export function DashboardShell({
    children,
    companyName,
    companyCnpj,
    userName,
    userCargo,
}: DashboardShellProps) {
    return (
        <Shell
            Sidebar={Sidebar}
            sidebarProps={{ companyName, companyCnpj, userName, userCargo }}
            variant="dashboard"
        >
            {children}
        </Shell>
    )
}

interface AdminShellProps {
    children: ReactNode
}

/**
 * Shell do Admin - wrapper de conveniência para o Shell unificado.
 * Mantido para retrocompatibilidade.
 * 
 * @deprecated Use o componente Shell diretamente para maior flexibilidade
 */
export function AdminShell({ children }: AdminShellProps) {
    return (
        <Shell
            Sidebar={AdminSidebar}
            variant="admin"
            withPadding
        >
            {children}
        </Shell>
    )
}
