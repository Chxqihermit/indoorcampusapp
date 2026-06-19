import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { Link } from "@inertiajs/react";
import { BookOpen, Folder, LayoutGrid, MapPin, Users } from "lucide-react";
import AppLogo from "./app-logo";
const mainNavItems = [
  {
    title: "Dashboard",
    href: dashboard(),
    icon: LayoutGrid
  },
  {
    title: "Indoor Map",
    href: "/indoor-map",
    icon: MapPin
  },
  {
    title: "Staff Directory",
    href: "/staff-directory",
    icon: Users
  }
];
const footerNavItems = [
  {
    title: "Repository",
    href: "https://github.com/laravel/react-starter-kit",
    icon: Folder
  },
  {
    title: "Documentation",
    href: "https://laravel.com/docs/starter-kits#react",
    icon: BookOpen
  }
];
function AppSidebar() {
  return <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>;
}
export {
  AppSidebar
};
