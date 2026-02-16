"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export default function Table({
    className,
    ...props
}: React.ComponentProps<"table">) {
    return (
        <div
            data-slot="table-container"
            className="relative w-full border rounded-md overflow-x-auto">
            <table
                data-slot="table"
                className={cn("w-full text-sm", className)}
                {...props}
            />
        </div>
    );
}

export function TableHeader({
    className,
    ...props
}: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                "select-none [&>tr]:border-b [&>tr]:bg-rose-100 [&>tr]:dark:bg-rose-950",
                className
            )}
            {...props}
        />
    );
}

export function TableBody({
    className,
    ...props
}: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn(
                "[&>tr]:even:bg-gray-100 dark:[&>tr]:even:bg-gray-900 [&>tr]:hover:bg-gray-200 dark:[&>tr]:hover:bg-gray-800 [&>tr]:transition-colors",
                className
            )}
            {...props}
        />
    );
}

export function TableFooter({
    className,
    ...props
}: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                "border-t font-medium [&>tr]:last:border-b-0",
                className
            )}
            {...props}
        />
    );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                "p-2 text-left align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
                className
            )}
            {...props}
        />
    );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return <tr data-slot="table-row" className={cn(className)} {...props} />;
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
                className
            )}
            {...props}
        />
    );
}

export function TableCaption({
    className,
    ...props
}: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("text-muted-foreground mt-4 text-sm", className)}
            {...props}
        />
    );
}

export function TableButton({
    className,
    ...props
}: React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                "p-1 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded text-gray-700 dark:text-gray-200 hover:cursor-pointer",
                className
            )}
            {...props}
        />
    );
}
