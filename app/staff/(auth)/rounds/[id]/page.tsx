import Heading from "@/components/Heading";
import Link from "next/link";
import { use } from "react";

export default function RoundPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
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
                    <Heading level={1}>Round {id}</Heading>
                </div>
            </div>
        </div>
    );
}
