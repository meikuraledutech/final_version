"use client"

import * as React from "react"
import {
  Home,
  Users,
  Building2,
  BookOpen,
  HelpCircle,
  Settings,
  ClipboardList,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/hooks/useAuth"
import { SmartFormsIcon } from "@/components/smart-forms-icon"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigationByRole = {
  superadmin: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "User Management",
      url: "/users",
      icon: Users,
    },
    {
      title: "Colleges",
      url: "/colleges",
      icon: Building2,
    },
    {
      title: "Batch Management",
      url: "/batches",
      icon: ClipboardList,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: BookOpen,
    },
    {
      title: "Questions",
      url: "/questions",
      icon: HelpCircle,
    },
    {
      title: "Test",
      url: "/test",
      icon: BarChart3,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  "college-admin": [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  trainer: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  students: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: BookOpen,
    },
    {
      title: "Test",
      url: "/test",
      icon: BarChart3,
    },
    {
      title: "Results",
      url: "/results",
      icon: ClipboardList,
    },
    {
      title: "Batch",
      url: "/batch",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

const data = {
  teams: [
    {
      name: "Meikural",
      logo: SmartFormsIcon,
      plan: "Pro",
    }
  ],
}

export function AppSidebar({
  activeItem,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeItem?: string
}) {
  const { claims } = useAuth()

  // Get user role from claims
  const userRole = claims?.role || "students"

  // Get navigation items based on role
  const navItems = navigationByRole[userRole as keyof typeof navigationByRole] || navigationByRole.students

  // Update items to set active based on prop
  const navMainWithActive = navItems.map(item => ({
    ...item,
    isActive: item.title === activeItem
  }))

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={navMainWithActive} />
      </SidebarHeader>
      <SidebarContent>
        {/* Bottom navigation - commented for later use */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
