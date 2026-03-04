"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import { TeamDisplay, TeamWithCount } from "@/lib/schema/team";
import Heading from "@/components/Heading";
import TeamsTable from "@/app/staff/(auth)/teams/TeamsTable";
import HeaderButton from "@/components/HeaderButton";

export default function TeamsPage() {
    const [teams, setTeams] = useState<TeamDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
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
                    const divisionInfo =
                        DIVISIONS[divisionCode] || DIVISIONS[0];

                    const displayId = `${divisionInfo.prefix}${team.id}`;

                    return {
                        id: team.id,
                        name: team.name,
                        school: team.school,
                        chaperone: team.chaperone,
                        chaperone_email: team.chaperone_email,
                        chaperone_phone: team.chaperone_phone,
                        division: divisionCode,
                        size: team.participant?.[0]?.count,
                        displayId: displayId,
                    };
                }
            );

            setTeams(formattedData);
            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Teams</Heading>
                <HeaderButton onClick={() => {}}>Add</HeaderButton>
            </div>

            <TeamsTable teams={teams} loading={loading} />
        </div>
    );
}
