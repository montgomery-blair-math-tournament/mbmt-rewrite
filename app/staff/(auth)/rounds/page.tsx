import { createClient } from "@/lib/supabase/server";
import Heading from "@/components/Heading";
import RoundCard from "@/components/RoundCard";
import { Round } from "@/lib/schema/round";

export default async function RoundsPage() {
    const supabase = await createClient();

    const { data: roundsData, error } = await supabase
        .from("round")
        .select("*")
        .order("division", { ascending: true })
        .order("name", { ascending: true });

    if (error || !roundsData) {
        console.error("Error fetching rounds:", error);
        return <div>Error loading rounds</div>;
    }

    const rounds = roundsData as Round[];

    const roundsWithStats = await Promise.all(
        rounds.map(async (round) => {
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

                const { data: problems } = await supabase
                    .from("problem")
                    .select("id")
                    .eq("round_id", round.id);

                if (problems && problems.length > 0) {
                    const pIds = problems.map((p) => p.id);

                    const { data: answers } = await supabase
                        .from("team_answer")
                        .select("team_id")
                        .in("problem_id", pIds)
                        .not("score", "is", null);

                    if (answers) {
                        const uniqueTeams = new Set(
                            answers.map((a) => a.team_id)
                        );
                        graded = uniqueTeams.size;
                    }
                }
            }

            return { ...round, stats: { graded, total: registered } };
        })
    );

    return (
        <div className="space-y-6">
            <Heading level={1}>Rounds</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roundsWithStats.map((round) => (
                    <RoundCard
                        key={round.id}
                        round={round}
                        stats={round.stats}
                    />
                ))}
            </div>
        </div>
    );
}
