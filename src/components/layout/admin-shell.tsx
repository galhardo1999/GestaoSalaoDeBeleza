"use client"

import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <aside
                className={cn(
                    "bg-white border-r border-gray-200 shadow-sm relative z-30 transition-all duration-300 ease-in-out hidden md:flex flex-col",
                    isCollapsed ? "w-[80px]" : "w-[280px]"
                )}
            >
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </aside>
            <main className="flex-1 overflow-auto w-full relative z-0">
                <div className="w-full p-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
