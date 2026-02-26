"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import Heading from "@/components/Heading";
import {
    ParticipantDisplay,
    ParticipantWithTeam,
} from "@/lib/schema/participant";
import ParticipantsTable from "@/components/ParticipantsTable";
import AddParticipantsModal from "@/components/AddParticipantsModal";
import { toast } from "sonner";
import HeaderButton from "@/components/HeaderButton";
import { HiPlus } from "react-icons/hi2";

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("participant")
                .select(
                    "*, team!participant_team_id_fkey(name, school, division, chaperone)"
                );

            if (error) {
                console.error("Error fetching participants:", error);
                toast.error("Error fetching participants");
                setLoading(false);
                return;
            }

            const formattedData = (data as ParticipantWithTeam[]).map((p) => {
                const teamData = p.team;
                const divisionCode = teamData?.division ?? 0;
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
    }, [supabase]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Participants</Heading>
                <HeaderButton onClick={() => setIsAddModalOpen(true)}>
                    <HiPlus className="w-4 h-4" />
                    Add
                </HeaderButton>
            </div>

            <ParticipantsTable participants={participants} loading={loading} />

            <AddParticipantsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
