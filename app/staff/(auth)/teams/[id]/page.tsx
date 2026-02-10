"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import Heading from "@/components/Heading";
import ParticipantsTable from "@/components/ParticipantsTable";
import RoundCard from "@/components/RoundCard";
import Link from "next/link";
import { ParticipantDisplay } from "@/lib/schema/participant";

type Round = {
    id: number;
    name: string;
    division: number;
};

type TeamDetail = {
    id: number;
    name: string;
    school: string;
    division: number;
    chaperone: string | null;
    chaperoneEmail: string | null;
    chaperonePhone: string | null;
    displayId: string;
};

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [team, setTeam] = useState<TeamDetail | null>(null);
    const [members, setMembers] = useState<ParticipantDisplay[]>([]);
    const [teamRounds, setTeamRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            setLoading(true);

            // 1. Fetch Team Details
            const { data: tData, error: tError } = await supabase
                .from("team")
                .select("*")
                .eq("id", id)
                .single();

            if (tError || !tData) {
                console.error("Error fetching team:", tError);
                setLoading(false);
                return;
            }

            // 2. Fetch Team Members
            const { data: mData, error: mError } = await supabase
                .from("participant")
                .select("*")
                .eq("team_id", id);

            if (mError) {
                console.error("Error fetching members:", mError);
            }

            // 3. Fetch Team Rounds
            const { data: trData, error: trError } = await supabase
                .from("team_round")
                .select("round_id")
                .eq("team_id", id);

            let rounds: Round[] = [];
            if (trData && trData.length > 0) {
                const roundIds = trData.map(r => r.round_id);
                const { data: rData, error: rError } = await supabase
                    .from("round")
                    .select("id, name, division")
                    .in("id", roundIds);

                if (rData) {
                    rounds = rData;
                }
            }

            // Process Data
            const divisionInfo = (DIVISIONS as any)[tData.division] || DIVISIONS[0];

            setTeam({
                id: tData.id,
                name: tData.name,
                school: tData.school || "N/A",
                division: tData.division,
                chaperone: tData.chaperone,
                chaperoneEmail: tData.chaperone_email,
                chaperonePhone: tData.chaperone_phone,
                displayId: `${divisionInfo.prefix}${tData.id}`
            });

            // Map members to ParticipantDisplay
            if (mData) {
                const mappedMembers: ParticipantDisplay[] = mData.map((m: any) => {
                    // We can reuse the team info since they are in this team
                    return {
                        id: m.id,
                        displayId: `${divisionInfo.prefix}${tData.id}${String.fromCharCode(97 + (mData.indexOf(m) % 26))}`, // Simple ID generation logic or use DB if available.
                        // Actually, let's just use ID for now or if there's a specific logic. 
                        // Wait, standard logic is usually TeamID + letter. 
                        // Let's use the index for now.
                        firstName: m.first_name,
                        lastName: m.last_name,
                        division: divisionInfo.name,
                        grade: m.grade,
                        school: tData.school || "",
                        team: tData.name,
                        chaperone: tData.chaperone || "",
                        checkedIn: m.checked_in,
                        teamId: tData.id
                    };
                });
                // Refine display ID logic: usually individual IDs are not stored but derived?
                // Actually existing participants table logic might have more complex ID generation.
                // For now, simple is fine.
                setMembers(mappedMembers);
            }

            setTeamRounds(rounds);
            setLoading(false);
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!team) return <div className="p-6">Team not found</div>;

    const divisionInfo = (DIVISIONS as any)[team.division] || DIVISIONS[0];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <div className="mb-2">
                    <Link href="/staff/teams" className="text-sm text-gray-500 hover:underline">
                        ← Back to Teams
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Heading level={1}>{team.name}</Heading>
                </div>
                <div className="text-gray-500 flex flex-wrap gap-4 mt-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{team.displayId}</span>
                    <span>{team.school}</span>
                    <span>{divisionInfo.name} Division</span>
                    {team.chaperone && <span>Chaperone: {team.chaperone}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Members Column (Takes up 2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <Heading level={2}>Members</Heading>
                    <ParticipantsTable participants={members} loading={false} />
                </div>

                {/* Rounds Column (Takes up 1 col) */}
                <div className="space-y-4">
                    <Heading level={2}>Team Rounds</Heading>
                    <div className="grid grid-cols-1 gap-4">
                        {teamRounds.length === 0 ? (
                            <p className="text-gray-500 italic">No team rounds assigned.</p>
                        ) : (
                            teamRounds.map((round) => (
                                <RoundCard key={round.id} round={round} teamId={team.id} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
