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
    userId,
    teamId,
    stats,
}: {
    round: Round;
    userId?: number;
    teamId?: number;
    stats?: {
        graded: number;
        total: number;
    };
}) {
    const divisionInfo = DIVISIONS[round.division] || DIVISIONS[0];
    const divisionName = divisionInfo.name;

    return (
        <Link href={`/staff/rounds/${round.id}`} className="block h-full">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{round.name}</CardTitle>
                    <CardDescription>{divisionName} Division</CardDescription>
                </CardHeader>
                <CardContent>
                    {userId && (
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-500">
                                Score
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                --
                            </span>
                        </div>
                    )}
                    {teamId && (
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-500">
                                Team Score
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                --
                            </span>
                        </div>
                    )}
                    {stats && (
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-500">
                                Progress
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                {stats.graded} / {stats.total}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
