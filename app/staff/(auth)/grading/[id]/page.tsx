import Heading from "@/components/Heading";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import GradingForm from "./GradingForm";
import { Problem, problemSchema } from "@/lib/schema/problem";

export default async function RoundGradingPage({
    params,
}: {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createClient();
    const searchParams = await params;
    const { data: roundData } = await supabase
        .from("round")
        .select("*")
        .eq("id", searchParams.id)
        .limit(1)
        .single();

    const { data: questionsData }: { data: Problem[] | null } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", roundData.id);

    questionsData?.sort((a, b) => a.number - b.number);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/grading"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Grading
                    </Link>
                </div>
                <div className="flex flex-col justify-center gap-4">
                    <Heading level={1}>Grading - {roundData.name}</Heading>
                    <GradingForm
                        roundId={roundData.id}
                        problems={questionsData ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
