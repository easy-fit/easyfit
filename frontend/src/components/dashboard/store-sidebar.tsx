'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, BarChart3, Boxes, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

type NavItem = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  url: string;
  key: string;
};

const baseItems: NavItem[] = [
  { title: 'Inicio', icon: Home, key: 'home', url: '/' }, // stays here
  { title: 'Estadísticas', icon: BarChart3, key: 'analytics', url: '/analytics' },
  { title: 'Productos', icon: Boxes, key: 'stock', url: '/products' },
  { title: 'Configuración', icon: Settings, key: 'settings', url: '/settings' },
];

export function StoreSidebar({
  storeName,
  logoUrl,
  active = 'home',
  baseHref = '',
}: {
  storeName?: string;
  logoUrl?: string;
  active?: string;
  baseHref?: string; // e.g. `/dashboard/123`, to build future links
}) {
  const items = React.useMemo(() => {
    // When you’re ready, replace # with `${baseHref}/subroute`
    return baseItems.map((i) => ({ ...i, url: i.url === '#' ? i.url : `${baseHref}${i.url}` }));
  }, [baseHref]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-gray-200 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <Image src={logoUrl!} alt={storeName!} fill sizes="40px" className="object-cover" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate font-semibold text-sm">{storeName}</div>
            <div className="text-xs text-muted-foreground">Panel de Tienda</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={active === item.key}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
