"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Youtube, Globe, DollarSign, MessageSquare } from "lucide-react"
import { HomePage } from "@/components/pages/home-page"
import { YoutubeStatsPage } from "@/components/pages/youtube-stats-page"
import { WebpageStatsPage } from "@/components/pages/webpage-stats-page"
import { SalesStatsPage } from "@/components/pages/sales-stats-page"
import { ChatPage } from "@/components/pages/chat-page"

const menuItems = [
  { id: "home", title: "Overview", icon: Home },
  { id: "youtube", title: "YouTube Stats", icon: Youtube },
  { id: "webpage", title: "Website Stats", icon: Globe },
  { id: "sales", title: "Sales Stats", icon: DollarSign },
  { id: "chat", title: "Chat with AI", icon: MessageSquare },
]

function AppSidebar({ currentPage, setCurrentPage }: { currentPage: string; setCurrentPage: (page: string) => void }) {
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Coaching Dashboard</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setCurrentPage(item.id)}
                isActive={currentPage === item.id}
                className="w-full transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("home")

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />
      case "youtube":
        return <YoutubeStatsPage />
      case "webpage":
        return <WebpageStatsPage />
      case "sales":
        return <SalesStatsPage />
      case "chat":
        return <ChatPage />
      default:
        return <HomePage />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="flex-1 overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <SidebarTrigger />
            </div>
            <div className="max-w-full overflow-x-auto scrollbar-thin">{renderPage()}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
