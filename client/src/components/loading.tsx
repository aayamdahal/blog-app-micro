import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
        <span className="relative inline-flex h-12 w-12 rounded-full border-4 border-primary/60 border-t-transparent animate-spin" />
      </span>
      <p className="text-sm font-semibold uppercase tracking-[0.4em]">Loading</p>
    </div>
  );
};

export default Loading;
