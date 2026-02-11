import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { DIVISIONS } from "@/lib/settings";

import { Round } from "@/lib/schema/round";

export default function RoundCard({
    round,
    userId,
    teamId,
}: {
    round: Round;
    userId?: number;
    teamId?: number;
}) {
    const divisionInfo = DIVISIONS[round.division] || DIVISIONS[0];
    const divisionName = divisionInfo.name;

    return (
        <Card>
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
            </CardContent>
        </Card>
    );
}
