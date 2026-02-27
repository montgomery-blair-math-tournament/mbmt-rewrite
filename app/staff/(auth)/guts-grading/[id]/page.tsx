import { Team } from "@/lib/schema/team";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GutsGradingForm from "./GutsGradingForm";

export default async function GutsRoundGradingPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    if (!id) {
        redirect("/staff/guts-grading");
    }
    const teamId = parseInt(id);
    const supabase = await createClient();

    const { data: teamData } = await supabase
        .from("team")
        .select("*")
        .eq("id", teamId)
        .limit(1)
        .single();
    if (!teamData) {
        return <div>Team not found</div>;
    }
    const team = teamData as Team;

    return (
        <div>
            <GutsGradingForm />
            <div>{JSON.stringify(team)}</div>
        </div>
    );
}
