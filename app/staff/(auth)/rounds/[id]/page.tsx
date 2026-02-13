import Heading from "@/components/Heading";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";
import ProblemCard from "@/components/ProblemCard";
import { DIVISIONS } from "@/lib/settings";

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

    return (
        <div className="space-y-6">
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/rounds"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Rounds
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Heading level={1}>{round.name}</Heading>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">
                        {DIVISIONS[round.division]?.name || "Unknown Division"}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 border border-blue-500 capitalize">
                        {round.type} Round
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <Heading level={2}>Problems</Heading>
                <div className="grid grid-cols-1 gap-4">
                    {problems.map((problem) => (
                        <ProblemCard key={problem.id} problem={problem} />
                    ))}
                </div>
            </div>
        </div>
    );
}
