import { cn } from "@/lib/utils";
import React from "react";

export default function Main({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 flex-1 max-w-5/6 p-8 mx-auto",
        className
      )}>
      {children}
    </div>
  );
}
