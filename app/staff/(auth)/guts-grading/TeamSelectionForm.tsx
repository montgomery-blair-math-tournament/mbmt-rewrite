"use client";

import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TeamDisplay } from "@/lib/schema/team";
import { useState } from "react";

export default function GutsTeamSelectionForm({
    teams,
    setTeam,
}: {
    teams: TeamDisplay[];
    setTeam: (arg0: TeamDisplay) => void;
}) {
    const [search, setSearch] = useState("");
    const [gradingId, setGradingId] = useState("");

    function handleSubmit() {
        teams.forEach((team) => {
            if (team.id === parseInt(gradingId)) {
                setTeam(team);
                return;
            }
        });
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border p-4 rounded-lg shadow-sm">
            <form className="flex items-center gap-2 w-full md:w-auto">
                <Input
                    placeholder="Enter Team ID"
                    value={gradingId}
                    onChange={(e) => setGradingId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full md:w-40"
                    required
                />
                <Button onClick={handleSubmit}>Select team</Button>
            </form>
        </div>
    );
}
