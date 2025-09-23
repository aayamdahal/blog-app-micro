"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { BoxSelect } from "lucide-react";
import { blogCategories, useAppData } from "@/context/AppContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const SideBar = () => {
  const { searchQuery, setSearchQuery, setCategory, category } = useAppData();

  const hasActiveFilters = searchQuery.trim().length > 0 || category.length > 0;

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("");
  };
  return (
    <Sidebar className="border-border/60 bg-white/70 backdrop-blur">
      <SidebarHeader className="bg-transparent px-6 pb-2 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Discover
        </p>
        <h2 className="text-2xl font-semibold text-foreground">The Reading Retreat</h2>
        <p className="text-sm text-muted-foreground">
          Refine your feed with focused search and curated topics.
        </p>
      </SidebarHeader>
      <SidebarContent className="bg-transparent px-4 pb-8">
        <SidebarGroup className="gap-3 rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm">
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Quick search
          </SidebarGroupLabel>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for stories, tags or authors"
            className="h-10 rounded-xl border-none bg-white/90"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          )}
        </SidebarGroup>
        <SidebarGroup className="mt-4 gap-3 rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm">
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Categories
          </SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCategory("")}
                isActive={category === ""}
                className="rounded-xl"
              >
                <BoxSelect
                  className={cn(
                    "h-4 w-4 transition-colors",
                    category === "" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>All topics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {blogCategories?.map((item) => {
              const isActive = category === item;
              return (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton
                    onClick={() => setCategory(item)}
                    isActive={isActive}
                    className={cn("rounded-xl capitalize", isActive ? "" : "text-muted-foreground")}
                  >
                    <BoxSelect
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{item}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
