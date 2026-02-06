"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import Heading from "@/components/Heading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiCheck, HiXMark } from "react-icons/hi2";
import Link from 'next/link';

type Round = {
    id: number;
    name: string;
    division: number;
};

type ParticipantDetail = {
    id: number;
    displayId: string;
    firstName: string;
    lastName: string;
    division: string;
    grade: number;
    school: string;
    team: string;
    checkedIn: boolean;
    individualRounds: Round[];
    teamRounds: Round[];
};

export default function ParticipantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [participant, setParticipant] = useState<ParticipantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // 1. Fetch participant details
            // We just fetch the team_id, we will fetch team details separately or via simple join if works.
            // Let's do simple join for team as that seemed to generally work, or fallback to manual if safer.
            // Actually, manual fetch for team is safest given schema issues.
            const { data: pData, error: pError } = await supabase
                .from("participant")
                .select("*")
                .eq("id", id)
                .single();

            if (pError || !pData) {
                console.error("Error fetching participant:", pError);
                setLoading(false);
                return;
            }

            // 2. Fetch Team Details (if exists)
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

            // 3. Fetch Participant Round IDs
            const { data: pRoundIds, error: prIdError } = await supabase
                .from("participant_round")
                .select("round_id")
                .eq("participant_id", id);

            // 4. Fetch Team Round IDs
            let tRoundIds: { round_id: number }[] = [];
            if (pData.team_id) {
                const { data: trRes, error: trError } = await supabase
                    .from("team_round")
                    .select("round_id")
                    .eq("team_id", pData.team_id);

                if (trRes) tRoundIds = trRes;
            }

            // 5. Fetch All Round Details
            const pRIds = pRoundIds?.map(x => x.round_id) || [];
            const tRIds = tRoundIds.map(x => x.round_id) || [];
            const allRoundIds = Array.from(new Set([...pRIds, ...tRIds]));

            let roundsMap = new Map<number, Round>();
            if (allRoundIds.length > 0) {
                const { data: rounds, error: roundsError } = await supabase
                    .from("round")
                    .select("id, name, division")
                    .in("id", allRoundIds);

                if (rounds) {
                    rounds.forEach((r: any) => roundsMap.set(r.id, r));
                }
            }

            // Construct Result
            const divisionCode = teamData?.division ?? 0;
            // @ts-ignore
            const divisionInfo = DIVISIONS[divisionCode] || DIVISIONS[0];

            const individualRounds = pRIds
                .map(rid => roundsMap.get(rid))
                .filter(r => r !== undefined) as Round[];

            const teamRounds = tRIds
                .map(rid => roundsMap.get(rid))
                .filter(r => r !== undefined) as Round[];

            setParticipant({
                id: pData.id,
                displayId: `${divisionInfo.prefix}${pData.id}`,
                firstName: pData.first_name,
                lastName: pData.last_name,
                division: divisionInfo.name,
                grade: pData.grade,
                school: teamData?.school || "N/A",
                team: teamData?.name || "N/A",
                checkedIn: pData.checked_in,
                individualRounds,
                teamRounds
            });
            setLoading(false);
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!participant) return <div className="p-6">Participant not found</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <div className="mb-2">
                    <Link href="/staff/participants" className="text-sm text-gray-500 hover:underline">
                        ← Back to Participants
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Heading level={1}>{participant.firstName} {participant.lastName}</Heading>
                    {participant.checkedIn ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400 flex items-center gap-1">
                            <HiCheck className="w-3 h-3" /> Checked In
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-400 flex items-center gap-1">
                            <HiXMark className="w-3 h-3" /> Not Checked In
                        </span>
                    )}
                </div>
                <div className="text-gray-500 flex gap-4 mt-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{participant.displayId}</span>
                    <span>{participant.school}</span>
                    <span>{participant.division} Division</span>
                    <span>Grade {participant.grade}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Individual Rounds */}
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Heading level={2}>Individual Rounds</Heading>
                    <div className="mt-4">
                        {participant.individualRounds.length === 0 ? (
                            <p className="text-gray-500 italic">No individual rounds assigned.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Round Name</TableHead>
                                        <TableHead>Division</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participant.individualRounds.map((round) => (
                                        <TableRow key={round.id}>
                                            <TableCell>{round.name}</TableCell>
                                            <TableCell>{(DIVISIONS as any)[round.division]?.name || round.division}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {/* Team Rounds */}
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <Heading level={2}>Team Rounds</Heading>
                    <div className="text-sm text-gray-500 mb-2">Team: {participant.team}</div>
                    <div className="mt-4">
                        {participant.teamRounds.length === 0 ? (
                            <p className="text-gray-500 italic">No team rounds assigned.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Round Name</TableHead>
                                        <TableHead>Division</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participant.teamRounds.map((round) => (
                                        <TableRow key={round.id}>
                                            <TableCell>{round.name}</TableCell>
                                            <TableCell>{(DIVISIONS as any)[round.division]?.name || round.division}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
