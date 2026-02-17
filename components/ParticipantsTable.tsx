"use client";

import { useState } from "react";
import Table, {
    TableBody,
    TableButton,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { HiOutlinePencil, HiCheck } from "react-icons/hi2";
import Link from "next/link";
import { ParticipantDisplay } from "@/lib/schema/participant";
import CheckInModal from "./CheckInModal";
import { redirect } from "next/navigation";

export default function ParticipantsTable({
    participants,
    loading,
    readonly = false,
}: {
    participants: ParticipantDisplay[];
    loading: boolean;
    readonly?: boolean;
}) {
    const [selectedParticipant, setSelectedParticipant] =
        useState<ParticipantDisplay | null>(null);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

    const handleCheckIn = (participant: ParticipantDisplay) => {
        setSelectedParticipant(participant);
        setIsCheckInModalOpen(true);
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {!readonly && <TableHead className="w-20"></TableHead>}
                        <TableHead>Checked In</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Chaperone</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={readonly ? 9 : 10}
                                className="text-center h-24">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : participants.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={readonly ? 9 : 10}
                                className="text-center h-24">
                                No participants found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        participants.map((participant) => (
                            <TableRow key={participant.id} className="group">
                                {!readonly && (
                                    <TableCell className="p-2">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TableButton title="Edit">
                                                <HiOutlinePencil
                                                    className="w-4 h-4"
                                                    onClick={() =>
                                                        redirect(
                                                            `/staff/participants/${participant.id}`
                                                        )
                                                    }
                                                />
                                            </TableButton>
                                            <TableButton
                                                onClick={() =>
                                                    handleCheckIn(participant)
                                                }
                                                title="Check In">
                                                <HiCheck className="w-4 h-4" />
                                            </TableButton>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell>
                                    {participant.checkedIn ? "Yes" : "No"}
                                </TableCell>
                                <TableCell>
                                    {readonly ? (
                                        participant.displayId
                                    ) : (
                                        <Link
                                            href={`/staff/participants/${participant.id}`}
                                            className="hover:underline text-rose-600 hover:text-rose-800">
                                            {participant.displayId}
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell>{participant.firstName}</TableCell>
                                <TableCell>{participant.lastName}</TableCell>
                                <TableCell>{participant.division}</TableCell>
                                <TableCell>{participant.grade}</TableCell>
                                <TableCell>{participant.school}</TableCell>
                                <TableCell>{participant.team}</TableCell>
                                <TableCell>{participant.chaperone}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <CheckInModal
                isOpen={isCheckInModalOpen}
                onClose={() => setIsCheckInModalOpen(false)}
                participant={selectedParticipant}
            />
        </>
    );
}
