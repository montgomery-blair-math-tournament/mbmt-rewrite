"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import Heading from "@/components/Heading";

import Link from "next/link";
import RoundCard from "@/components/RoundCard";
import { toast } from "sonner";

import { ParticipantDetail } from "@/lib/schema/participant";
import { Round } from "@/lib/schema/round";
import CheckInModal from "@/components/CheckInModal";
import SuccessBadge from "@/components/SuccessBadge";
import { TeamDetail } from "@/lib/schema/team";

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
        (async () => {
            if (!id) return;

            const { data: participantData, error: participantFetchError } =
                await supabase
                    .from("participant")
                    .select("*")
                    .eq("id", id)
                    .limit(1)
                    .single();

            if (
                participantFetchError ||
                !participantData ||
                !participantData.team_id
            ) {
                console.error(
                    "Error fetching participant:",
                    participantFetchError
                );
                toast.error("Error fetching participant");
                setLoading(false);
                return;
            }

            const { data: teamData, error: tError } = await supabase
                .from("team")
                .select("id, name, school, division, chaperone")
                .eq("id", participantData.team_id)
                .limit(1)
                .single();

            if (tError) {
                console.error(tError);
                toast.error("An error occurred while fetching team data");
            }

            const { data: pRoundIds } = await supabase
                .from("participant_round")
                .select("round_id")
                .eq("participant_id", id);
            let tRoundIds: { round_id: number }[] = [];
            if (participantData.team_id) {
                const { data: trRes } = await supabase
                    .from("team_round")
                    .select("round_id")
                    .eq("team_id", participantData.team_id);

                if (trRes) tRoundIds = trRes;
            }

            const pRIds = pRoundIds?.map((x) => x.round_id) || [];
            const tRIds = tRoundIds.map((x) => x.round_id) || [];
            const allRoundIds = Array.from(new Set([...pRIds, ...tRIds]));

            const roundsMap = new Map<number, Round>();
            if (allRoundIds.length > 0) {
                const { data: rounds } = await supabase
                    .from("round")
                    .select("id, name, division, type")
                    .in("id", allRoundIds);

                if (rounds) {
                    rounds.forEach((r: Round) => roundsMap.set(r.id, r));
                }
            }

            const individualRounds = pRIds
                .map((rid) => roundsMap.get(rid))
                .filter((r) => r !== undefined) as Round[];

            const teamRounds = tRIds
                .map((rid) => roundsMap.get(rid))
                .filter((r) => r !== undefined) as Round[];

            const tData = teamData! as TeamDetail;

            setParticipant({
                id: participantData.id,
                code: participantData.code,
                teamCode: tData.code,
                firstName: participantData.first_name,
                lastName: participantData.last_name,
                division: participantData.division,
                grade: participantData.grade,
                school: tData.school,
                team: tData.name,
                chaperone: tData.chaperone || "N/A",
                checkedIn: participantData.checked_in,
                individualRounds,
                teamRounds,
                teamId: tData.id,
            });
            setLoading(false);
        })();
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
                    <h1 className="font-bold font-sans text-4xl my-4">
                        {participant.firstName} {participant.lastName}
                    </h1>

                    <SuccessBadge
                        success={participant.checkedIn}
                        onClick={() =>
                            !participant.checkedIn &&
                            setIsCheckInModalOpen(true)
                        }
                        successText="Checked In"
                        failText="Not Checked In"
                    />
                </div>
                <div className="text-gray-700 dark:text-gray-300 flex gap-4 mt-2">
                    <span className="font-mono dark:text-gray-700 text-gray-300 bg-gray-700 dark:bg-gray-300 px-2 py-0.5 rounded text-sm">
                        {participant.code}
                    </span>
                    <span>
                        <Link
                            href={`/staff/teams/${participant.teamId}`}
                            className="text-rose-600 hover:underline hover:text-rose-800">
                            {participant.team}
                        </Link>
                    </span>
                    <span>{participant.school}</span>
                    <span>
                        {participant.division === "A" ? "Abel" : "Jacobi"}{" "}
                        Division
                    </span>
                    <span>Grade {participant.grade}</span>
                </div>
            </div>

            {/* Individual rounds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
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
                <div className="flex flex-col gap-4">
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
