import Link from "next/link";
import React from "react";
import { Card } from "./ui/card";
import { ArrowUpRight, Calendar, Clock3 } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  image: string;
  title: string;
  desc: string;
  id: string;
  time: string;
  category?: string;
  view?: "grid" | "list";
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  desc,
  id,
  time,
  category,
  view = "grid",
}) => {
  const formattedDate = time ? moment(time).format("MMM DD, YYYY") : "";
  const wordCount = desc ? desc.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 180)) || 1;
  const snippet = desc ?? "";

  const imageSection = (
    <div
      className={cn(
        "relative overflow-hidden",
        view === "list" ? "sm:w-2/5" : "h-52 w-full"
      )}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-out",
            view === "list" ? "sm:h-full" : ""
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 text-sm font-medium text-primary/80">
          Image unavailable
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {category && (
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm">
          {category}
        </span>
      )}
    </div>
  );

  return (
    <Link
      href={`/blog/${id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
    >
      <Card
        className={cn(
          "h-full overflow-hidden border border-border/70 bg-white/90 p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
          "gap-0",
          view === "list"
            ? "flex flex-col sm:flex-row sm:items-stretch"
            : "flex flex-col"
        )}
      >
        {imageSection}
        <div
          className={cn(
            "flex flex-1 flex-col gap-4 p-6",
            view === "list" ? "sm:p-6" : ""
          )}
        >
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {formattedDate && (
              <span className="flex items-center gap-2 normal-case tracking-normal">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </span>
            )}
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:block" />
            <span className="flex items-center gap-2 normal-case tracking-normal">
              <Clock3 className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
            {title}
          </h2>
          <p
            className={cn(
              "text-sm text-muted-foreground",
              view === "list" ? "line-clamp-3" : "line-clamp-3"
            )}
          >
            {snippet}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-sm font-medium text-primary">
            <span className="flex items-center gap-2">
              Read story
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            {category && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {category}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;
