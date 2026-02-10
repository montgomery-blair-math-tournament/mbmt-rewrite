"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import { ParticipantDisplay, ParticipantWithTeam } from "@/lib/schema/participant";
import ParticipantsTable from "@/components/ParticipantsTable";
import AddParticipantsModal from "@/components/AddParticipantsModal";

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("participant")
                .select("*, team!participant_team_id_fkey(name, school, division, chaperone)");

            if (error) {
                console.error("Error fetching participants:", error);
                setLoading(false);
                return;
            }

            // Transform data
            const formattedData = (data as unknown as ParticipantWithTeam[]).map((p) => {
                const teamData = p.team;
                const divisionCode = teamData?.division ?? 0;
                // @ts-ignore - Indexing with number is safe given settings structure
                const divisionInfo = DIVISIONS[divisionCode] || DIVISIONS[0];

                return {
                    id: p.id,
                    displayId: `${divisionInfo.prefix}${p.id}`,
                    firstName: p.first_name,
                    lastName: p.last_name,
                    division: divisionInfo.name,
                    grade: p.grade,
                    school: teamData?.school || "N/A",
                    team: teamData?.name || "N/A",
                    chaperone: teamData?.chaperone || "N/A",
                    checkedIn: p.checked_in,
                    teamId: p.team_id,
                };
            });
            setParticipants(formattedData);
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Participants</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-rose-800 text-white px-4 py-2 rounded-md hover:bg-rose-700 hover:cursor-pointer"
                >
                    Add
                </button>
            </div>

            <ParticipantsTable participants={participants} loading={loading} />

            <AddParticipantsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
