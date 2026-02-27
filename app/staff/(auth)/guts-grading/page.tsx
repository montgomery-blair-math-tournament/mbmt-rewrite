"use client";

import Heading from "@/components/Heading";
import { useEffect, useState } from "react";
import { TeamDisplay, TeamWithCount } from "@/lib/schema/team";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DIVISIONS } from "@/lib/constants/settings";
import { Input } from "@/components/ui/Input";
import GutsTeamSelectionForm from "./TeamSelectionForm";
// import TeamsTable from "../teams/TeamsTable";

export default function GutsGradingPage() {
    const [teams, setTeams] = useState<TeamDisplay[]>([]);
    const [currentTeam, setCurrentTeam] = useState<TeamDisplay>();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data: teamsData, error } = await supabase
                    .from("team")
                    .select("*, participant!participant_team_id_fkey(count)");

                if (error) {
                    console.error("Error fetching teams:", error);
                    setLoading(false);
                    return;
                }

                const formattedData: TeamDisplay[] = (
                    teamsData as TeamWithCount[]
                ).map((t) => {
                    const divisionCode = t.division ?? 0;
                    const divisionInfo =
                        DIVISIONS[divisionCode] || DIVISIONS[0];

                    const displayId = `${divisionInfo.prefix}${t.id}`;

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
            } catch (error) {
                console.error(error);
                toast.error("An error was encountered.");
            } finally {
                setLoading(false);
            }
        })();
    }, [supabase]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Guts Grading</Heading>
            </div>
            {/* <TeamsTable teams={teams} loading={loading} /> */}
            <GutsTeamSelectionForm teams={teams} setTeam={setCurrentTeam} />
        </div>
    );
}
