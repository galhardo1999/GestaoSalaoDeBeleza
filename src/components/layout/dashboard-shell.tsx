"use client"

import { useState } from "react"
import { Scissors } from "lucide-react"
import { Sidebar } from "./sidebar"

export function DashboardShell({ children, companyName, companyCnpj, userName, userCargo }: { children: React.ReactNode, companyName?: string, companyCnpj?: string, userName?: string, userCargo?: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="dark relative min-h-screen bg-[#0D0D0D] text-[#F5F0E8] font-sans">
            <div className={`hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 border-r border-[#2A2418] bg-[#0F0F0F] shadow-[18px_0_45px_rgba(0,0,0,0.38)] ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}>
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
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[#D4AF37]/30" />
                <div className="relative z-10 border-b border-[#2A2418] bg-[#0F0F0F]/95 px-4 py-4 md:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37]">
                                <Scissors className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-heading text-lg leading-none text-[#F5F0E8]">Barber & Co.</p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A84C]">Gestão premium</p>
                            </div>
                        </div>
                        {companyName && (
                            <p className="max-w-[42vw] truncate text-right text-xs font-medium text-[#A9A198]" title={companyName}>
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
