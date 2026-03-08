import Heading from "@/components/Heading";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.id) {
        redirect("/staff");
    }

    const { data: roleData } = await supabase
        .from("user")
        .select("role")
        .eq("id", user.id)
        .limit(1)
        .single();
    if (!roleData || roleData.role !== "admin") {
        redirect("/staff");
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Admin</Heading>
            </div>
            <div className="flex flex-col gap-4 justify-between items-baseline"></div>
        </div>
    );
}
