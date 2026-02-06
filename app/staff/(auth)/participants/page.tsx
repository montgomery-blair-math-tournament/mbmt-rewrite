"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { HiOutlinePencil, HiCheck } from "react-icons/hi2";
import { DIVISIONS } from "@/lib/settings";
import { ParticipantDisplay, ParticipantWithTeam } from "@/lib/schema/participant";

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("participant")
                .select("*, team(name, school, division, chaperone)");

            if (error) {
                console.error("Error fetching participants:", error);
                setLoading(false);
                return;
            }

            // Transform data
            const formattedData: ParticipantDisplay[] = (data as unknown as ParticipantWithTeam[]).map((p) => {
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
                    coach: teamData?.chaperone || "N/A",
                    checkedIn: p.checked_in,
                    teamId: p.team_id,
                };
            });
            debugger;
            setParticipants(formattedData);
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Participants</h1>
                <button className="bg-rose-800 text-white px-4 py-2 rounded-md hover:bg-rose-700 hover:cursor-pointer">
                    Add
                </button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* Actions Column (Width w-20 approx) */}
                            <TableHead className="w-[80px]"></TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>Division</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>School</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Coach</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : participants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center h-24">
                                    No participants found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            participants.map((p) => (
                                <TableRow key={p.id} className="group hover:bg-gray-50">
                                    <TableCell className="p-2">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Edit">
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Check In">
                                                <HiCheck className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell>{p.checkedIn ? "Yes" : "No"}</TableCell>
                                    <TableCell>{p.displayId}</TableCell>
                                    <TableCell>{p.firstName}</TableCell>
                                    <TableCell>{p.lastName}</TableCell>
                                    <TableCell>{p.division}</TableCell>
                                    <TableCell>{p.grade}</TableCell>
                                    <TableCell>{p.school}</TableCell>
                                    <TableCell>{p.team}</TableCell>
                                    <TableCell>{p.coach}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
