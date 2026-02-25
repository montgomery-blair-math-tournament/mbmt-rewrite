import StaffNavbar from "@/components/StaffNavbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/staff/login");
    }

    return (
        <div className="flex flex-col">
            <StaffNavbar />
            <main className="flex flex-col flex-1 w-full p-8">{children}</main>
        </div>
    );
}
