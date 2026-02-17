import Heading from "@/components/Heading";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RoundGradingPage({
    params,
}: {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createClient();
    const { data: roundData } = await supabase
        .from("round")
        .select("*")
        .eq("id", (await params).id)
        .limit(1)
        .single();

    const { data: questionsData } = await supabase
        .from("questions")
        .select("*");

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
                <div className="flex items-center gap-4">
                    <Heading level={1}>Grading</Heading>
                    <p className="text-xl font-bold">
                        {JSON.stringify(roundData)}
                    </p>
                </div>
            </div>
        </div>
    );
}
