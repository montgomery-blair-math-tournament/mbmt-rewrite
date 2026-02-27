import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { redirect } from "next/navigation";

export default async function StaffNavbar() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/staff/login");
    }

    const { data } = await supabase
        .from("user")
        .select("first_name")
        .eq("id", user.id)
        .limit(1)
        .single();

    const links = [
        { label: "Grading", href: "/staff/grading" },
        { label: "Participants", href: "/staff/participants" },
        { label: "Teams", href: "/staff/teams" },
        { label: "Rounds", href: "/staff/rounds" },
        // { label: "Announcements", href: "/staff/announcements" },
        { label: "Guts Grading", href: "/staff/guts-grading" },
        { label: "Admin", href: "/staff/admin" },
    ];

    return (
        <div className="flex gap-1 md:gap-2 w-full p-2 bg-gray-200 items-center overflow-x-auto">
            <Link
                href="/staff"
                className="select-none rounded-md text-center text-lg font-semibold align-center transition-colors hover:bg-gray-300 py-1.5 px-3 md:px-4">
                Staff Panel
            </Link>

            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="select-none rounded-md text-center align-center transition-colors hover:bg-gray-300 py-1.5 px-2 md:px-3 text-sm md:text-base">
                    {link.label}
                </Link>
            ))}
            {user && (
                <div className="ml-auto font-medium px-2 flex items-center">
                    <span>Hi, {data?.first_name || "User"}!</span>
                    <form action="/staff/auth/signout" method="POST">
                        <Button
                            type="submit"
                            variant="ghost"
                            className="ml-4 hover:bg-gray-300 select-none py-1.5 px-2 md:px-3 text-sm md:text-base h-auto">
                            Logout
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
