"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"

export function DashboardShell({ children, companyName, companyCnpj }: { children: React.ReactNode, companyName?: string, companyCnpj?: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="h-full relative bg-gray-50">
            <div className={`hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300 bg-white border-r ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    companyName={companyName}
                    companyCnpj={companyCnpj}
                />
            </div>
            <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                {children}
            </main>
        </div>
    )
}
