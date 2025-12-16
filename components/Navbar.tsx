import Link from "next/link";

export default function Navbar() {
    return (
        <div className="flex gap-2 w-full p-2 dark:bg-rose-950">
            <div className="flex justify-self-end gap-2">
                <Link
                    href="/"
                    className="rounded-md duration-150 hover:bg-rose-800 py-0.5 px-1.5">
                    Home
                </Link>
                <Link
                    href="/register"
                    className="rounded-md duration-150 hover:bg-rose-800 py-0.5 px-1.5">
                    Register
                </Link>
                <Link
                    href="/rules"
                    className="rounded-md duration-150 hover:bg-rose-800 py-0.5 px-1.5">
                    Rules
                </Link>
            </div>
        </div>
    );
}
