import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
    let loggedIn = false;
    const supabase = await createClient();
    if ((await supabase.auth.getSession()).data.session?.user) {
        loggedIn = true;
    }

    const linkStyle: string =
        "rounded-md text-center align-center duration-200 hover:bg-rose-600 dark:hover:bg-rose-800 py-1.5 px-1.5 md:px-2 md:py-1 text-white";

    return (
        <div className="flex gap-1 md:gap-2 w-full p-2 md:p-3 dark:bg-rose-950 bg-rose-900">
            <Link
                href="/"
                className="rounded-md text-center text-lg align-center duration-200 hover:bg-rose-600 dark:hover:bg-rose-800 py-0.5 px-1.5 md:px-2 text-white">
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
            {loggedIn && (
                <Link
                    href="/staff"
                    className={cn(linkStyle, "ml-auto font-bold")}>
                    Staff Panel
                </Link>
            )}
            <Link
                href="/register"
                className={cn(linkStyle, { "ml-auto": !loggedIn })}>
                Register
            </Link>
        </div>
    );
}
