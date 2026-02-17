import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: roleData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user?.id)
        .limit(1)
        .single();

    if (!user || error || !roleData || roleData.role !== "admin") {
        redirect("/staff");
    }

    return <div>{children}</div>;
}
