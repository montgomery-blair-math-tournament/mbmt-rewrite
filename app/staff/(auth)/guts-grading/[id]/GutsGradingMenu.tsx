import { TeamDisplay } from "@/lib/schema/team";
import { useState } from "react";
import GutsGradingModal from "./GutsGradingModal";

export default function GutsGradingMenu({ teams }: { teams: TeamDisplay[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [team, setTeam] = useState<TeamDisplay>();

    return (
        <>
            <div className="flex flex-col gap-2">
                {teams.map((team) => (
                    <div key={team.id}>{team.id}</div>
                ))}
            </div>
            {isModalOpen && <GutsGradingModal />}
        </>
    );
}
