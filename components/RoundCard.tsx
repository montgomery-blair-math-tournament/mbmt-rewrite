import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DIVISIONS } from "@/lib/settings";

interface Round {
    id: number;
    name: string;
    division: number;
}

interface RoundCardProps {
    round: Round;
    userId?: number; // Optional: if present, logic to fetch score could be added here
    teamId?: number; // Optional: context
    // For now, since we don't have score data, we just display the round info
}

export default function RoundCard({ round, userId, teamId }: RoundCardProps) {
    // const divisionName = (DIVISIONS as any)[round.division]?.name || round.division;
    // Safely access DIVISIONS
    const divisionInfo = (DIVISIONS as any)[round.division] || DIVISIONS[0];
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
                        <span className="text-sm font-medium text-gray-500">Score</span>
                        <span className="text-lg font-bold text-gray-900">--</span>
                    </div>
                )}
                {teamId && (
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-500">Team Score</span>
                        <span className="text-lg font-bold text-gray-900">--</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
