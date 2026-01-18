
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Building2, Car, LayoutGrid, Users, UserCheck, Shield, Key, Route, Briefcase, MapPin, Factory, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Permissions',
        href: '/permissions',
        icon: Key,
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
    },
    {
        title: 'Departments',
        href: '/departments',
        icon: Briefcase,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Drivers',
        href: '/drivers',
        icon: UserCheck,
    },
    {
        title: 'User Groups',
        href: '/user-groups',
        icon: UsersRound,
    },


    // {
    //     title: 'Products',
    //     href: '/products',
    //     icon: Package,
    // },
    {
        title: 'Vendors',
        href: '/vendors',
        icon: Building2,
    },
    {
        title: 'Factories',
        href: '/factories',
        icon: Factory,
    },

    {
        title: 'Logistics',
        href: '/logistics',
        icon: Briefcase,
    },
    {
        title: 'Vehicles',
        href: '/vehicles',
        icon: Car,
    },
    {
        title: 'Routes',
        href: '/routes',
        icon: Route,
    },
    {
        title: 'Trips',
        href: '/trips',
        icon: MapPin,
    },

];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip={{ children: "RSC Vehicle Management System" }}>
                            <Link href="/dashboard" prefetch>
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

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
