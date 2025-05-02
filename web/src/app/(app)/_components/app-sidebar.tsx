"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
} from "@/components/ui/sidebar";
import {
  ChartCandlestick,
  List,
  type LucideProps,
  PackageSearch,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ForwardRefExoticComponent } from "react";
import { NavUser } from "./nav-user";

const data = [
  {
    title: "General",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: ChartCandlestick,
      },
      {
        title: "Products",
        url: "/products",
        icon: PackageSearch,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: List,
      },
    ],
  },
] as {
  title: string;
  items: {
    title: string;
    url: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  }[];
}[];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-16 max-md:mt-2 mb-2 justify-center">
        <Image
          src="/logo.jpeg"
          alt="logo"
          width={48}
          height={48}
          className="size-12 group-data-[collapsible=icon]:size-8 transition-[width,height] duration-200 ease-in-out"
        />
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        {data.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/65">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem className="mt-2" key={item.title}>
                    <SidebarMenuLink
                      className="group/menu-button group-data-[collapsible=icon]:px-[5px]! gap-3 h-9 [&>svg]:size-auto"
                      tooltip={item.title}
                      isActive={pathname === item.url}
                      href={item.url}
                    >
                      {item.icon && (
                        <item.icon
                          className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
                          size={22}
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary">
                        {item.title}
                      </span>
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
