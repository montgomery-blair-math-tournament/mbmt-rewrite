"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import Heading from "@/components/Heading";
import {
    ParticipantDisplay,
    ParticipantWithTeam,
} from "@/lib/schema/participant";
import ParticipantsTable from "@/components/ParticipantsTable";
import AddParticipantsModal from "@/app/staff/(auth)/participants/AddParticipantsModal";
import { toast } from "sonner";
import HeaderButton from "@/components/HeaderButton";
import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import { Input } from "@/components/ui/Input";

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const fetchData = useCallback(async () => {
        const supabase = createClient();
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
                displayTeamId: teamData
                    ? `T${divisionInfo.prefix}${p.team_id}`
                    : null,
                isFlagged: p.is_flagged,
            };
        });
        setParticipants(formattedData);
        setLoading(false);
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchData();
        };
        load();
    }, [fetchData]);

    const filteredParticipants = useMemo(() => {
        if (!searchTerm.trim()) return participants;
        const lowerQuery = searchTerm.toLowerCase();
        return participants.filter(
            (p) =>
                p.firstName.toLowerCase().includes(lowerQuery) ||
                p.lastName.toLowerCase().includes(lowerQuery) ||
                p.displayId.toLowerCase().includes(lowerQuery) ||
                p.school.toLowerCase().includes(lowerQuery) ||
                p.team.toLowerCase().includes(lowerQuery)
        );
    }, [participants, searchTerm]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Heading level={1}>Participants</Heading>
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto flex-1 sm:justify-end">
                    <div className="w-full sm:max-w-sm relative">
                        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Search names, IDs, schools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10"
                        />
                    </div>
                    <HeaderButton onClick={() => setIsAddModalOpen(true)}>
                        <HiPlus className="w-4 h-4" />
                        Add
                    </HeaderButton>
                </div>
            </div>

            <ParticipantsTable
                participants={filteredParticipants}
                loading={loading}
                onDelete={() => {
                    setLoading(true);
                    fetchData();
                }}
            />

            <AddParticipantsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setLoading(true);
                    fetchData();
                }}
            />
        </div>
    );
}
