import { createClient } from "@/lib/supabase/server";
import Heading from "@/components/Heading";
import RoundCard from "@/components/RoundCard";
import { Round } from "@/lib/schema/round";
import HeaderButton from "@/components/HeaderButton";
import { HiMiniCalculator } from "react-icons/hi2";
import { calculateIndividualScores } from "./actions";

export default async function GradingPage() {
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
            const isTeam = round.type === "team" || round.type === "guts";

            if (isTeam) {
                const { count: regCount } = await supabase
                    .from("team_round")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id);

                const { count: gradedCount } = await supabase
                    .from("team_score")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id)
                    .eq("status", "COMPLETED");

                registered = regCount || 0;
                graded = gradedCount || 0;
            } else {
                // Individual
                const { count: regCount } = await supabase
                    .from("participant_round")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id);

                const { count: gradedCount } = await supabase
                    .from("participant_score")
                    .select("*", { count: "exact", head: true })
                    .eq("round_id", round.id)
                    .eq("status", "COMPLETED");

                registered = regCount || 0;
                graded = gradedCount || 0;
            }

            return { ...round, stats: { graded, total: registered } };
        })
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Grading</Heading>
                <HeaderButton onClick={calculateIndividualScores}>
                    <HiMiniCalculator className="h-4 w-4" /> Compute individual
                    scores
                </HeaderButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roundsWithStats.map((round) => (
                    <RoundCard
                        key={round.id}
                        round={round}
                        showProgress={true}
                        stats={round.stats}
                        showDetails={false} // Don't show generic details, focusing on grading
                        href={`/staff/grading/${round.id}`}
                    />
                ))}
            </div>
        </div>
    );
}
