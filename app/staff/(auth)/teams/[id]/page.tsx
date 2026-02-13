"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import { TeamDetail } from "@/lib/schema/team";
import { Round } from "@/lib/schema/round";

import Heading from "@/components/Heading";
import ParticipantsTable from "@/components/ParticipantsTable";
import RoundCard from "@/components/RoundCard";
import Link from "next/link";
import { ParticipantDisplay } from "@/lib/schema/participant";
import { toast } from "sonner";

export default function TeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
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

            const { data: tData, error: tError } = await supabase
                .from("team")
                .select("*")
                .eq("id", id)
                .single();

            if (tError || !tData) {
                console.error("Error fetching team:", tError);
                toast.error("Error fetching team");
                setLoading(false);
                return;
            }

            const { data: mData, error: mError } = await supabase
                .from("participant")
                .select("*")
                .eq("team_id", id);

            if (mError) {
                console.error("Error fetching members:", mError);
                toast.error("Error fetching members");
            }

            const { data: trData } = await supabase
                .from("team_round")
                .select("round_id")
                .eq("team_id", id);

            let rounds: Round[] = [];
            if (trData && trData.length > 0) {
                const roundIds = trData.map((r) => r.round_id);
                const { data: rData } = await supabase
                    .from("round")
                    .select("id, name, division, type")
                    .in("id", roundIds);

                if (rData) {
                    rounds = rData;
                }
            }

            const divisionInfo = DIVISIONS[tData.division] || DIVISIONS[0];

            setTeam({
                id: tData.id,
                name: tData.name,
                school: tData.school,
                division: tData.division,
                chaperone: tData.chaperone,
                chaperoneEmail: tData.chaperone_email,
                chaperonePhone: tData.chaperone_phone,
                displayId: `T${divisionInfo.prefix}${tData.id}`,
            });

            if (mData) {
                const mappedMembers: ParticipantDisplay[] = mData.map((m) => {
                    return {
                        id: m.id,
                        displayId: `${divisionInfo.prefix}${m.id}`,
                        firstName: m.first_name,
                        lastName: m.last_name,
                        division: divisionInfo.name,
                        grade: m.grade,
                        school: tData.school,
                        team: tData.name,
                        chaperone: tData.chaperone,
                        checkedIn: m.checked_in,
                        teamId: tData.id,
                    };
                });
                setMembers(mappedMembers);
            }

            setTeamRounds(rounds);
            setLoading(false);
        };

        fetchData();
    }, [id, supabase]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!team) return <div className="p-6">Team not found</div>;

    const divisionInfo = DIVISIONS[team.division] || DIVISIONS[0];

    return (
        <div className="space-y-6">
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/teams"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Teams
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Heading level={1}>{team.name}</Heading>
                </div>
                <div className="text-gray-500 flex flex-wrap gap-4 mt-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
                        {team.displayId}
                    </span>
                    <span>{team.school}</span>
                    <span>{divisionInfo.name} Division</span>
                    {team.chaperone && <span>Chaperone: {team.chaperone}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Heading level={2}>Members</Heading>
                    <ParticipantsTable participants={members} loading={false} />
                </div>

                <div className="space-y-4">
                    <Heading level={2}>Team Rounds</Heading>
                    <div className="grid grid-cols-1 gap-4">
                        {teamRounds.length === 0 ? (
                            <p className="text-gray-500 italic">
                                No team rounds assigned.
                            </p>
                        ) : (
                            teamRounds.map((round) => (
                                <RoundCard key={round.id} round={round} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
