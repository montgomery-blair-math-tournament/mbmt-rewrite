import Heading from "@/components/Heading";
import Link from "next/link";

export default function RoundGradingPage() {
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
                <div className="flex items-center gap-4">
                    <Heading level={1}>Grading</Heading>
                </div>
            </div>
        </div>
    );
}
