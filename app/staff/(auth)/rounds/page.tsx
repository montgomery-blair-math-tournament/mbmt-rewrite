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
            let numQuestions = 0;

            if (round.type === "individual") {
                const { count: regCount } = await supabase
                    .from("participant_round")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id);

                // Currently individual rounds don't have problems in the database in the same way,
                // or we assume they do. Let's try to fetch problems for them too if they exist.
                // If the schema supports it. Based on previous analysis, `problem` table has `round_id`.
                const { count: qCount } = await supabase
                    .from("problem")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id);

                registered = regCount || 0;
                numQuestions = qCount || 0;
            } else if (round.type === "team") {
                const { count: regCount } = await supabase
                    .from("team_round")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id);

                registered = regCount || 0;

                const { count: qCount } = await supabase
                    .from("problem")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id);

                numQuestions = qCount || 0;
            }

            return {
                ...round,
                stats: { graded: 0, total: registered }, // Graded is not needed for this view but struct requires it if we used strict typing, but we are passing explicit props now.
                numQuestions,
            };
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
                        showDetails={true}
                        numQuestions={round.numQuestions}
                        stats={round.stats}
                        href={`/staff/rounds/${round.id}`}
                    />
                ))}
            </div>
        </div>
    );
}
