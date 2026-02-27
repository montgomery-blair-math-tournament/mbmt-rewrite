import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const linkStyle: string =
        "select-none rounded-md text-center align-center transition-all hover:bg-accent-hover py-1.5 px-1.5 md:px-2 md:py-1 text-white";

    return (
        <div className="flex gap-1 md:gap-2 w-full p-2 md:p-3 bg-accent">
            <Link
                href="/"
                className="select-none rounded-md text-center text-lg align-center transition-all hover:bg-accent-hover py-0.5 px-1.5 md:px-2 text-white">
                MBMT
            </Link>
            <Link href="/about" className={linkStyle}>
                About
            </Link>
            <Link href="/rules" className={linkStyle}>
                Rules
            </Link>
            <Link href="/info" className={linkStyle}>
                Info
            </Link>
            <Link href="/archive" className={linkStyle}>
                Archive
            </Link>
            {user && (
                <Link
                    href="/staff"
                    className={cn(linkStyle, "ml-auto font-bold")}>
                    Staff Panel
                </Link>
            )}
            <Link
                href="/register"
                className={cn(linkStyle, { "ml-auto": !user })}>
                Register
            </Link>
        </div>
    );
}
