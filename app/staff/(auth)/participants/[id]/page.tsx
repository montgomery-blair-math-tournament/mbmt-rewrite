"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import Heading from "@/components/Heading";

import { HiCheck, HiXMark } from "react-icons/hi2";
import Link from "next/link";
import RoundCard from "@/components/RoundCard";
import { toast } from "sonner";
import { ParticipantDetail } from "@/lib/schema/participant";
import { Round } from "@/lib/schema/round";
import CheckInModal from "@/components/CheckInModal";
import Badge from "@/components/Badge";

export default function ParticipantPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [participant, setParticipant] = useState<ParticipantDetail | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            const { data: pData, error: pError } = await supabase
                .from("participant")
                .select("*")
                .eq("id", id)
                .single();

            if (pError || !pData) {
                console.error("Error fetching participant:", pError);
                toast.error("Error fetching participant");
                setLoading(false);
                return;
            }

            let teamData = null;
            if (pData.team_id) {
                const { data: tData, error: tError } = await supabase
                    .from("team")
                    .select("id, name, school, division, chaperone")
                    .eq("id", pData.team_id)
                    .single();

                if (!tError) {
                    teamData = tData;
                }
            }

            const { data: pRoundIds } = await supabase
                .from("participant_round")
                .select("round_id")
                .eq("participant_id", id);
            let tRoundIds: { round_id: number }[] = [];
            if (pData.team_id) {
                const { data: trRes } = await supabase
                    .from("team_round")
                    .select("round_id")
                    .eq("team_id", pData.team_id);

                if (trRes) tRoundIds = trRes;
            }

            const pRIds = pRoundIds?.map((x) => x.round_id) || [];
            const tRIds = tRoundIds.map((x) => x.round_id) || [];
            const allRoundIds = Array.from(new Set([...pRIds, ...tRIds]));

            const roundsMap = new Map<number, Round>();
            if (allRoundIds.length > 0) {
                const { data: rounds } = await supabase
                    .from("round")
                    .select("*")
                    .in("id", allRoundIds);

                if (rounds) {
                    rounds.forEach((r: Round) => roundsMap.set(r.id, r));
                }
            }

            const divisionCode = teamData?.division ?? 0;
            const divisionInfo = DIVISIONS[divisionCode] || DIVISIONS[0];

            const individualRounds = pRIds
                .map((rid) => roundsMap.get(rid))
                .filter((r) => r !== undefined) as Round[];

            const teamRounds = tRIds
                .map((rid) => roundsMap.get(rid))
                .filter((r) => r !== undefined) as Round[];

            setParticipant({
                id: pData.id,
                display_id: `${divisionInfo.prefix}${pData.id}`,
                first_name: pData.first_name,
                last_name: pData.last_name,
                division: divisionInfo.name,
                grade: pData.grade,
                school: teamData?.school,
                team: teamData?.name,
                chaperone: teamData?.chaperone,
                checked_in: pData.checked_in,
                individualRounds,
                teamRounds,
                team_id: pData.team_id ?? 0,
                display_team_id: "T" + (pData.team_id ?? 0),
                is_flagged: pData.is_flagged,
            });
            setLoading(false);
        };

        fetchData();
    }, [id, supabase]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!participant) return <div className="p-6">Participant not found</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Participant info */}
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/participants"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Participants
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {/* Participant name */}
                    <Heading level={1}>
                        {participant.first_name} {participant.last_name}
                    </Heading>
                    <Badge
                        onClick={() => setIsCheckInModalOpen(true)}
                        className="mt-2"
                        variant={
                            participant.checked_in ? "success" : "failure"
                        }>
                        {participant.checked_in ? (
                            <>
                                <HiCheck className="w-4 h-4" /> Checked In
                            </>
                        ) : (
                            <>
                                <HiXMark className="w-4 h-4" /> Not Checked In
                            </>
                        )}
                    </Badge>
                </div>
            </div>
            <div className="text-gray-700 flex gap-4 mt-2">
                <span className="font-mono text-gray-300 bg-gray-700 px-2 py-0.5 rounded text-sm">
                    {participant.display_id}
                </span>
                <span>
                    <Link
                        href={`/staff/teams/${participant.team_id}`}
                        className="text-red-600 hover:underline hover:text-red-800">
                        {participant.team}
                    </Link>
                </span>
                <span>{participant.school}</span>
                <span>{participant.division} Division</span>
                <span>Grade {participant.grade}</span>
            </div>

            {/* Individual rounds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Heading level={2}>Individual Rounds</Heading>
                    <div className="grid grid-cols-1 gap-4">
                        {participant.individualRounds.length === 0 ? (
                            <p className="text-gray-500 italic">
                                No individual rounds assigned.
                            </p>
                        ) : (
                            participant.individualRounds.map((round) => (
                                <RoundCard key={round.id} round={round} />
                            ))
                        )}
                    </div>
                </div>

                {/* Team rounds */}
                <div className="space-y-4">
                    <Heading level={2}>Team Rounds</Heading>
                    <div className="grid grid-cols-1 gap-4">
                        {participant.teamRounds.length === 0 ? (
                            <p className="text-gray-500 italic">
                                No team rounds assigned.
                            </p>
                        ) : (
                            participant.teamRounds.map((round) => (
                                <RoundCard key={round.id} round={round} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <CheckInModal
                isOpen={isCheckInModalOpen}
                onClose={() => setIsCheckInModalOpen(false)}
                participant={participant}
            />
        </div>
    );
}

// function CheckedInButton({
//     checkedIn = false,
//     className,
//     ...props
// }: { checkedIn: boolean } & React.ComponentProps<"button">) {
//     return (
//         <button
//             className={cn(
//                 {
//                     "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400 flex items-center gap-1 hover:bg-green-200 hover:cursor-pointer transition-colors":
//                         checkedIn,
//                     "bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400 flex items-center gap-1 hover:bg-gray-300 hover:cursor-pointer transition-colors":
//                         !checkedIn,
//                 },
//                 className
//             )}
//             {...props}>
//             {checkedIn ? (
//                 <>
//                     <HiCheck className="w-3 h-3" /> Checked In
//                 </>
//             ) : (
//                 <>
//                     <HiXMark className="w-3 h-3" /> Not Checked In
//                 </>
//             )}
//         </button>
//     );
// }
