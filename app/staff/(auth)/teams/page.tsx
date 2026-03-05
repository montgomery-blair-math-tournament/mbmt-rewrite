"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import { TeamDisplay, TeamWithCount } from "@/lib/schema/team";
import Heading from "@/components/Heading";
import TeamsTable from "@/app/staff/(auth)/teams/TeamsTable";
import HeaderButton from "@/components/HeaderButton";
import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import { Input } from "@/components/ui/Input";
import AddTeamsModal from "@/app/staff/(auth)/teams/AddTeamsModal";

export default function TeamsPage() {
    const [teams, setTeams] = useState<TeamDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("team")
            .select("*, participant!participant_team_id_fkey(count)");

        if (error) {
            console.error("Error fetching teams:", error);
            setLoading(false);
            return;
        }

        const formattedData: TeamDisplay[] = (data as TeamWithCount[]).map(
            (team) => {
                const divisionCode = team.division ?? 0;
                const divisionInfo = DIVISIONS[divisionCode] || DIVISIONS[0];

                const displayId = `T${divisionInfo.prefix}${team.id}`;

                return {
                    id: team.id,
                    name: team.name,
                    school: team.school || "",
                    chaperone: team.chaperone || "",
                    chaperone_email: team.chaperone_email,
                    chaperone_phone: team.chaperone_phone,
                    division: divisionCode,
                    size: team.participant?.[0]?.count || 0,
                    displayId: displayId,
                };
            }
        );

        setTeams(formattedData);
        setLoading(false);
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchData();
        };
        load();
    }, [fetchData]);

    const filteredTeams = useMemo(() => {
        if (!searchTerm.trim()) return teams;
        const lowerQuery = searchTerm.toLowerCase();
        return teams.filter(
            (t) =>
                t.name.toLowerCase().includes(lowerQuery) ||
                t.displayId.toLowerCase().includes(lowerQuery) ||
                (t.school && t.school.toLowerCase().includes(lowerQuery)) ||
                (t.chaperone &&
                    t.chaperone.toLowerCase().includes(lowerQuery)) ||
                DIVISIONS[t.division]?.name.toLowerCase().includes(lowerQuery)
        );
    }, [teams, searchTerm]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Heading level={1}>Teams</Heading>
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

            <TeamsTable
                teams={filteredTeams}
                loading={loading}
                onDelete={() => {
                    setLoading(true);
                    fetchData();
                }}
            />

            <AddTeamsModal
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
