"use client";
import Link from "next/link";
import React from "react";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { blogCategories, useAppData } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  Filter,
  LayoutGrid,
  Rows3,
  Search,
  Sparkles,
} from "lucide-react";

type LayoutType = "grid" | "list";
type SortOrder = "newest" | "oldest";

const BlogGridSkeleton = ({ layout }: { layout: LayoutType }) => {
  const items = layout === "grid" ? 6 : 4;
  return (
    <div
      className={cn(
        "gap-6",
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col"
      )}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "overflow-hidden rounded-3xl border border-border/60 bg-white/80 shadow-sm",
            layout === "list"
              ? "flex flex-col sm:flex-row sm:items-stretch"
              : "flex flex-col"
          )}
        >
          <Skeleton
            className={cn(
              "w-full",
              layout === "list" ? "h-40 sm:w-2/5" : "h-52"
            )}
          />
          <div className="flex flex-1 flex-col gap-4 p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="mt-auto flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const {
    blogLoading,
    blogs,
    searchQuery,
    setSearchQuery,
    setCategory,
    category,
    isAuth,
  } = useAppData();

  const [layout, setLayout] = React.useState<LayoutType>("grid");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");

  const sortedBlogs = React.useMemo(() => {
    if (!blogs) return [];
    const sorted = [...blogs];
    sorted.sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
    });
    return sorted;
  }, [blogs, sortOrder]);

  const hasResults = sortedBlogs.length > 0;
  const hasActiveFilters =
    searchQuery.trim().length > 0 || category.trim().length > 0;

  const toggleCategory = (value: string) => {
    if (category === value) {
      setCategory("");
    } else {
      setCategory(value);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/80 px-6 py-10 shadow-sm sm:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--primary)/12,transparent_70%)]" />
        <div className="flex flex-col gap-6">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary/80">
            <Sparkles className="h-4 w-4" /> Curated daily reads
          </span>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            A calm, minimal space to explore thoughtful writing.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Dive into hand-picked stories across technology, creativity and more.
            Refine your feed with the live search, topic pills or advanced filters
            when you need something specific.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by keyword, topic or author"
                className="h-12 rounded-xl border border-border/60 bg-white/95 pl-11"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full border-dashed"
                onClick={toggleSidebar}
              >
                <Filter className="h-4 w-4" />
                <span>Advanced filters</span>
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {blogCategories.map((item) => {
              const isActive = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCategory(item)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-white text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            {hasResults
              ? `Showing ${sortedBlogs.length} curated ${
                  sortedBlogs.length === 1 ? "story" : "stories"
                }`
              : "No stories to show yet"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Sorted by {sortOrder === "newest" ? "most recent" : "oldest first"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as SortOrder)}
          >
            <SelectTrigger className="w-[170px] rounded-full border border-border/60 bg-white/90">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-white/90 p-1">
            <Button
              type="button"
              variant={layout === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-full"
              onClick={() => setLayout("grid")}
              aria-pressed={layout === "grid"}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              type="button"
              variant={layout === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-full"
              onClick={() => setLayout("list")}
              aria-pressed={layout === "list"}
            >
              <Rows3 className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
      </div>

      <section>
        {blogLoading ? (
          <BlogGridSkeleton layout={layout} />
        ) : hasResults ? (
          <div
            className={cn(
              "gap-6",
              layout === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col"
            )}
          >
            {sortedBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                image={blog.image}
                title={blog.title}
                desc={blog.description}
                id={blog.id}
                time={blog.created_at}
                category={blog.category}
                view={layout}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/70 bg-white/60 px-6 py-12 text-center shadow-sm">
            <Sparkles className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              We couldn’t find any matching posts.
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Try adjusting your filters or start something new. Fresh stories make
              this space feel alive.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" className="rounded-full" onClick={clearFilters}>
                Reset filters
              </Button>
              {isAuth ? (
                <Button className="rounded-full" asChild>
                  <Link href="/blog/new">Write a story</Link>
                </Button>
              ) : (
                <Button variant="ghost" className="rounded-full" asChild>
                  <Link href="/login">Sign in to publish</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Blogs;
