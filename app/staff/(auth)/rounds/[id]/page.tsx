import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";
import RoundDetailClient from "./RoundDetailClient";

export default async function RoundPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: round, error: roundError } = await supabase
        .from("round")
        .select("*")
        .eq("id", parseInt(id))
        .limit(1)
        .single();

    if (roundError || !round) {
        console.error("Error fetching round:", roundError);
        return <div>Error loading round</div>;
    }

    const { data: problemsData, error: problemsError } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", parseInt(id))
        .order("number", { ascending: true });

    if (problemsError) {
        console.error("Error fetching problems:", problemsError);
        return <div>Error loading problems</div>;
    }

    const problems = problemsData as Problem[];

    let registered = 0;
    let graded = 0;

    if (round.type === "individual") {
        const { count: regCount } = await supabase
            .from("participant_round")
            .select("*", { count: "exact", head: true })
            .eq("round_id", round.id);

        const { count: gradCount } = await supabase
            .from("score")
            .select("*", { count: "exact", head: true })
            .eq("round_id", round.id);

        registered = regCount || 0;
        graded = gradCount || 0;
    } else if (round.type === "team") {
        const { count: regCount } = await supabase
            .from("team_round")
            .select("*", { count: "exact", head: true })
            .eq("round_id", round.id);

        registered = regCount || 0;

        if (problems.length > 0) {
            const pIds = problems.map((p) => p.id);

            const { data: answers } = await supabase
                .from("team_answer")
                .select("team_id")
                .in("problem_id", pIds)
                .not("score", "is", null);

            if (answers) {
                const uniqueTeams = new Set(answers.map((a) => a.team_id));
                graded = uniqueTeams.size;
            }
        }
    }

    const stats = { graded, total: registered };

    return (
        <RoundDetailClient round={round} problems={problems} stats={stats} />
    );
}
