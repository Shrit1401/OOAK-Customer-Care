import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MessageSquare, Image as ImageIcon, ChevronRight } from "lucide-react";
import Image from "next/image";

const navigationItems = [
  {
    title: "New chat",
    icon: MessageSquare,
  },
];

const chatItems = [
  "JS function ideas",
  "New chat",
  "Rephrase in style",
  "AI tools for PPT creation",
  "MCP server over HTTPS",
  "Prepare MCP server HTTPS",
  "Unique MCP server ideas",
  "MCP server ideas",
  "Free and paid APIs",
  "Free Indian stock APIs",
  "Stock ask name ideas",
];

const OSidebar = () => {
  return (
    <Sidebar
      className="bg-[#171717] border-r border-[#2a2a2a]"
      collapsible="icon"
    >
      <SidebarContent className="p-4 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 relative">
              <img src="/logo.svg" alt="Ooak" className="rounded" />
            </div>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>

        <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-4 hidden">
          <SidebarTrigger>
            <button className="p-2 hover:bg-[#2a2a2a] rounded-lg">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </SidebarTrigger>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]">
              {navigationItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="group-data-[collapsible=icon]:hidden"
                >
                  <SidebarMenuButton
                    className="w-full justify-start group-data-[collapsible=icon]:justify-center gap-3 px-3 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded-lg"
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 px-3 mb-2">
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatItems.map((chat, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    className="w-full justify-start gap-3 px-3 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded-lg"
                    tooltip={chat}
                  >
                    <span className="text-sm truncate">{chat}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default OSidebar;
