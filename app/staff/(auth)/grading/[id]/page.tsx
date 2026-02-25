import { createClient } from "@/lib/supabase/server";
import GradingClient from "@/components/grading/GradingClient";
import Heading from "@/components/Heading";
import Link from "next/link";
import { Round } from "@/lib/schema/round";
import { Problem } from "@/lib/schema/problem";
import { GradingStatus } from "@/lib/schema/score";

export default async function RoundGradingPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const roundId = parseInt(id);
    const supabase = await createClient();

    // 1. Fetch Round
    const { data: roundData } = await supabase
        .from("round")
        .select("*")
        .eq("id", roundId)
        .single();

    if (!roundData) {
        return <div>Round not found</div>;
    }
    const round = roundData as Round;

    // 2. Fetch Problems
    const { data: problemsData } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", roundId)
        .order("number", { ascending: true });

    const problems = (problemsData || []) as Problem[];

    // 3. Fetch Participants/Teams and Scores
    let rows: any[] = [];
    let isTeam = round.type === "team" || round.type === "guts";

    if (isTeam) {
        // Fetch Teams in this round
        const { data: teamRounds } = await supabase
            .from("team_round")
            .select(
                `
                team:team_id (id, name, displayId)
            `
            )
            .eq("round_id", roundId);

        // Fetch Scores
        const { data: scores } = await supabase
            .from("team_score")
            .select("*")
            .eq("round_id", roundId);

        const scoreMap = new Map();
        scores?.forEach((s) => scoreMap.set(s.team_id, s));

        rows = (teamRounds || [])
            .map((tr: any) => {
                const t = tr.team;
                if (!t) return null;
                const s = scoreMap.get(t.id);
                return {
                    id: t.id,
                    displayId: t.name,
                    name: t.name,
                    status: s?.status || GradingStatus.NOT_STARTED,
                    score: s?.score,
                    roundId,
                };
            })
            .filter(Boolean);
    } else {
        // Individual
        // Fetch Participants in this round
        const { data: participantRounds } = await supabase
            .from("participant_round")
            .select(
                `
                participant:participant_id (id, first_name, last_name)
            `
            )
            .eq("round_id", roundId);

        // Fetch Scores
        const { data: scores } = await supabase
            .from("participant_score")
            .select("*")
            .eq("round_id", roundId);

        const scoreMap = new Map();
        scores?.forEach((s) => scoreMap.set(s.participant_id, s));

        rows = (participantRounds || [])
            .map((pr: any) => {
                const p = pr.participant;
                if (!p) return null;
                const s = scoreMap.get(p.id);
                return {
                    id: p.id,
                    displayId: p.id.toString(),
                    name: `${p.first_name} ${p.last_name}`,
                    status: s?.status || GradingStatus.NOT_STARTED,
                    score: s?.score,
                    roundId,
                };
            })
            .filter(Boolean);
    }

    // Stats
    const total = rows.length;
    const completed = rows.filter(
        (r) => r.status === GradingStatus.COMPLETED
    ).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/grading"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Grading
                    </Link>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level={1}>Grading: {round.name}</Heading>
                        <p className="text-gray-500">
                            {completed} / {total} Graded ({progress}%)
                        </p>
                    </div>
                </div>
            </div>

            <GradingClient
                round={round}
                problems={problems}
                participants={rows}
            />
        </div>
    );
}
