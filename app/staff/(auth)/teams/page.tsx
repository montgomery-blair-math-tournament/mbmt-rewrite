"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import { TeamDisplay, TeamWithCount } from "@/lib/schema/team";
import Heading from "@/components/Heading";
import TeamsTable from "@/components/TeamsTable";
import Button from "@/components/ui/Button";

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

            const formattedData: TeamDisplay[] = (
                data as unknown as TeamWithCount[]
            ).map((t) => {
                const divisionCode = t.division ?? 0;
                const divisionInfo = DIVISIONS[divisionCode] || DIVISIONS[0];

                const displayId = `T${divisionInfo.prefix}${t.id}`;

                return {
                    id: t.id,
                    displayId: displayId,
                    name: t.name,
                    school: t.school,
                    chaperone: t.chaperone,
                    division: divisionInfo.name,
                    size: t.participant?.[0]?.count,
                };
            });

            setTeams(formattedData);
            setLoading(false);
        };

        fetchData();
    }, [supabase]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Heading level={1}>Teams</Heading>
                <Button className="bg-rose-800 hover:bg-rose-700 text-white">
                    Add
                </Button>
            </div>

            <TeamsTable teams={teams} loading={loading} />
        </div>
    );
}
