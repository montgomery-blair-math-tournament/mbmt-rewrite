import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import Link from "next/link";
import { DIVISIONS } from "@/lib/settings";
import { Round } from "@/lib/schema/round";

export default function RoundCard({
    round,
    href,
    showProgress = false,
    showDetails = false,
    numQuestions,
    stats,
}: {
    round: Round;
    href?: string;
    showProgress?: boolean;
    showDetails?: boolean;
    numQuestions?: number;
    stats?: {
        graded: number;
        total: number;
    };
}) {
    const divisionInfo = DIVISIONS[round.division] || DIVISIONS[0];
    const divisionName = divisionInfo.name;
    const linkHref = href || `/staff/rounds/${round.id}`;

    return (
        <Link href={linkHref} className="block h-full">
            <Card className="h-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{round.name}</CardTitle>
                    <CardDescription>{divisionName} Division</CardDescription>
                </CardHeader>
                <CardContent>
                    {showProgress && stats && (
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-500">
                                Progress
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                {stats.graded} / {stats.total}
                            </span>
                        </div>
                    )}
                    {showDetails && (
                        <div className="flex flex-col gap-2 mt-2">
                            {numQuestions !== undefined && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">
                                        Questions
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {numQuestions}
                                    </span>
                                </div>
                            )}
                            {stats && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">
                                        Participants
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {stats.total}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
