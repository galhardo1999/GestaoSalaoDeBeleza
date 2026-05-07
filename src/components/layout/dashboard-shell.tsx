"use client"

import { useState } from "react"
import { Scissors } from "lucide-react"
import { Sidebar } from "./sidebar"

export function DashboardShell({ children, companyName, companyCnpj, userName, userCargo }: { children: React.ReactNode, companyName?: string, companyCnpj?: string, userName?: string, userCargo?: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="relative min-h-screen bg-dashboard-background text-dashboard-foreground font-sans">
            <div className={`hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 border-r border-dashboard-border bg-dashboard-sidebar shadow-[18px_0_45px_rgba(86,66,31,0.10)] dark:shadow-[18px_0_45px_rgba(0,0,0,0.38)] ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}>
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    companyName={companyName}
                    companyCnpj={companyCnpj}
                    userName={userName}
                    userCargo={userCargo}
                />
            </div>
            <main className={`relative min-h-screen overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
                <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(212,175,55,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(245,240,232,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-dashboard-primary/30" />
                <div className="relative z-10 border-b border-dashboard-border bg-dashboard-sidebar/95 px-4 py-4 md:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-dashboard-primary/35 bg-dashboard-primary/10 text-dashboard-primary">
                                <Scissors className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-heading text-lg leading-none text-dashboard-foreground">Barber & Co.</p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-dashboard-primary">Gestão premium</p>
                            </div>
                        </div>
                        {companyName && (
                            <p className="max-w-[42vw] truncate text-right text-xs font-medium text-dashboard-muted" title={companyName}>
                                {companyName}
                            </p>
                        )}
                    </div>
                </div>
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
