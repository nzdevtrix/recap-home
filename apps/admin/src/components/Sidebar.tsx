"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building,
  Bike,
  ShoppingBag,
  Map,
  Bell,
  Settings,
  AlertTriangle,
  UserPlus,
  Package,
  BarChart3,
  Shield,
  FileText,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Businesses",
    href: "/businesses",
    icon: Building,
  },
  {
    title: "Riders",
    href: "/riders",
    icon: Bike,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Regions",
    href: "/regions",
    icon: Map,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Emergency",
    href: "/emergency",
    icon: AlertTriangle,
    variant: "destructive",
  },
  {
    title: "Add Personnel",
    href: "/add-personnel",
    icon: UserPlus,
  },
  {
    title: "System Logs",
    href: "/logs",
    icon: FileText,
  },
  {
    title: "Security",
    href: "/security",
    icon: Shield,
  },
]

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    children: [
      { title: "All Users", href: "/users" },
      { title: "Add User", href: "/users/add" },
      { title: "Roles & Permissions", href: "/users/roles" },
    ],
  },
  {
    title: "Business Management",
    href: "/businesses",
    icon: Building,
    children: [
      { title: "All Businesses", href: "/businesses" },
      { title: "Pending Verification", href: "/businesses/pending" },
      { title: "Categories", href: "/businesses/categories" },
    ],
  },
  {
    title: "Rider Management",
    href: "/riders",
    icon: Bike,
    children: [
      { title: "All Riders", href: "/riders" },
      { title: "Pending Approval", href: "/riders/pending" },
      { title: "Available Riders", href: "/riders/available" },
    ],
  },
  {
    title: "Order Management",
    href: "/orders",
    icon: ShoppingBag,
    children: [
      { title: "All Orders", href: "/orders" },
      { title: "Active Orders", href: "/orders/active" },
      { title: "Completed Orders", href: "/orders/completed" },
      { title: "Cancelled Orders", href: "/orders/cancelled" },
    ],
  },
  {
    title: "Regions",
    href: "/regions",
    icon: Map,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Emergency Controls",
    href: "/emergency",
    icon: AlertTriangle,
    variant: "destructive",
  },
  {
    title: "Add Personnel",
    href: "/add-personnel",
    icon: UserPlus,
  },
  {
    title: "System Logs",
    href: "/logs",
    icon: FileText,
  },
  {
    title: "Security",
    href: "/security",
    icon: Shield,
  },
]

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  variant?: "default" | "destructive"
  children?: { title: string; href: string }[]
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside className={cn("w-64 h-screen bg-background border-r", className)}>
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Recap Home
        </h1>
        <p className="text-sm text-muted-foreground">Control Center</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {adminNavItems.map((item) => (
            <li key={item.href} className="space-y-0.5">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  "transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href) && "bg-accent text-accent-foreground",
                  item.variant === "destructive" && "text-destructive"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
              
              {item.children && isActive(item.href) && (
                <ul className="ml-6 mt-1 space-y-0.5">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={cn(
                          "text-sm py-1.5 px-3 rounded-md",
                          "hover:bg-accent/50 hover:text-accent-foreground",
                          pathname === child.href && "bg-accent/50 text-accent-foreground"
                        )}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Infrastructure Management Portal</p>
          <p className="text-[10px]">HQ - All Operations Control Center</p>
        </div>
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  return (
    <div className="lg:hidden">
      {/* Mobile sidebar implementation can be added here */}
    </div>
  )
}
