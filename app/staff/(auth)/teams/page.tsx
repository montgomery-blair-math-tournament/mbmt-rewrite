"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/settings";
import { TeamDisplay, TeamWithCount } from "@/lib/schema/team";
import TeamsTable from "@/components/TeamsTable";

export default function TeamsPage() {
    const [teams, setTeams] = useState<TeamDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("team")
                .select("*, participant(count)");

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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Teams</h1>
                <button className="bg-rose-800 text-white px-4 py-2 rounded-md hover:bg-rose-700 hover:cursor-pointer">
                    Add
                </button>
            </div>

            <TeamsTable teams={teams} loading={loading} />
        </div>
    );
}
