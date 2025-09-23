"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LogIn, Menu, PenSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navLinks = [
  { label: "Explore", href: "/blogs" },
  { label: "Saved", href: "/blog/saved", requireAuth: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading, isAuth, user } = useAppData();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TR";

  const renderLinks = (mobile = false) => (
    <ul
      className={cn(
        "flex items-center gap-6 text-sm font-medium",
        mobile && "flex-col items-start gap-4 text-base"
      )}
    >
      {navLinks.map((link) => {
        if (link.requireAuth && !isAuth) return null;
        const isActive = pathname?.startsWith(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              onClick={mobile ? closeMenu : undefined}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link
          href="/blogs"
          className="flex items-center gap-3"
          onClick={closeMenu}
          aria-label="The Reading Retreat"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase tracking-wide text-primary">
            TR
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              The Reading Retreat
            </span>
            <span className="text-base font-semibold text-foreground">
              Minimal stories for curious minds
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {renderLinks()}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
            ) : isAuth ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  asChild
                >
                  <Link href="/blog/new" className="flex items-center gap-2">
                    <PenSquare className="h-4 w-4" />
                    <span>Write</span>
                  </Link>
                </Button>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-2 py-1.5 pr-3 shadow-sm transition-colors hover:border-primary/40"
                >
                  <Avatar className="h-9 w-9 border border-border/60">
                    <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Profile"} />
                    <AvatarFallback className="text-xs font-semibold uppercase text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground xl:block">
                    {user?.name?.split(" ")[0] ?? "Profile"}
                  </span>
                </Link>
              </>
            ) : (
              <Button size="sm" className="rounded-full" asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign in</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden px-4 transition-all duration-300 ease-in-out",
          isOpen ? "pointer-events-auto max-h-[400px] pb-4" : "pointer-events-none max-h-0"
        )}
      >
        <div className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-border/60 bg-white/95 p-5 shadow-lg">
          {renderLinks(true)}
          <div className="h-px w-full bg-border/60" />
          {loading ? (
            <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
          ) : isAuth ? (
            <div className="flex w-full flex-col gap-3">
              <Button
                variant="outline"
                className="w-full rounded-full"
                asChild
                onClick={closeMenu}
              >
                <Link href="/blog/new" className="flex items-center justify-center gap-2">
                  <PenSquare className="h-4 w-4" />
                  <span>Write a story</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-2xl border border-transparent px-4 py-3 text-left text-sm"
                asChild
                onClick={closeMenu}
              >
                <Link href="/profile" className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/70">
                    <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Profile"} />
                    <AvatarFallback className="text-sm font-semibold uppercase text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {user?.name ?? "Your profile"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Manage account & saved reads
                    </span>
                  </div>
                </Link>
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full rounded-full"
              asChild
              onClick={closeMenu}
            >
              <Link href="/login" className="flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5" />
                <span>Sign in to continue</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
