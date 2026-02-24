import Heading from "@/components/Heading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/staff/login");
    }

    const { data: roleData, error } = await supabase
        .from("user")
        .select("role")
        .eq("id", user.id)
        .limit(1)
        .single();

    if (!user || error || !roleData || roleData.role !== "admin") {
        redirect("/staff");
    }
    return (
        <div className="flex flex-col gap-6">
            <Heading level={1}>Admin</Heading>
        </div>
    );
}
