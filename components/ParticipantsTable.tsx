"use client";

import { useState, useMemo } from "react";
import Table, {
    TableBody,
    TableButton,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    HiOutlinePencil,
    HiCheck,
    HiOutlineTrash,
    HiChevronUp,
    HiChevronDown,
    HiChevronUpDown,
} from "react-icons/hi2";
import Link from "next/link";
import { ParticipantDisplay } from "@/lib/schema/participant";
import CheckInModal from "./CheckInModal";
import { redirect, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Modal, { ModalButton } from "@/components/ui/Modal";

const SortableHeader = ({
    column,
    label,
    currentSortColumn,
    currentSortDirection,
    onSort,
}: {
    column: keyof ParticipantDisplay;
    label: string;
    currentSortColumn: keyof ParticipantDisplay | null;
    currentSortDirection: "asc" | "desc" | null;
    onSort: (col: keyof ParticipantDisplay) => void;
}) => {
    const isActive = currentSortColumn === column;
    return (
        <TableHead
            className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
            onClick={() => onSort(column)}>
            <div className="flex items-center gap-1 group/header">
                {label}
                <span className="text-gray-500">
                    {isActive && currentSortDirection === "asc" ? (
                        <HiChevronUp className="w-4 h-4 text-gray-800" />
                    ) : isActive && currentSortDirection === "desc" ? (
                        <HiChevronDown className="w-4 h-4 text-gray-800" />
                    ) : (
                        <HiChevronUpDown className="w-4 h-4 opacity-50 group-hover/header:opacity-100 transition-opacity" />
                    )}
                </span>
            </div>
        </TableHead>
    );
};

export default function ParticipantsTable({
    participants,
    loading,
    readonly = false,
    onDelete,
}: {
    participants: ParticipantDisplay[];
    loading: boolean;
    readonly?: boolean;
    onDelete?: () => void;
}) {
    const [selectedParticipant, setSelectedParticipant] =
        useState<ParticipantDisplay | null>(null);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [participantToDelete, setParticipantToDelete] =
        useState<ParticipantDisplay | null>(null);
    const [sortColumn, setSortColumn] = useState<
        keyof ParticipantDisplay | null
    >(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null
    );
    const router = useRouter();
    const supabase = createClient();

    const handleCheckIn = (participant: ParticipantDisplay) => {
        setSelectedParticipant(participant);
        setIsCheckInModalOpen(true);
    };

    const handleDeleteClick = (participant: ParticipantDisplay) => {
        setParticipantToDelete(participant);
    };

    const confirmDelete = async () => {
        if (!participantToDelete) return;
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: roleData } = await supabase
            .from("user")
            .select("role")
            .eq("id", user.id)
            .limit(1)
            .single();
        if (!roleData || roleData.role !== "admin") {
            return toast.error(
                "You do not have sufficient permissions to delete a participant."
            );
        }

        setIsDeleting(participantToDelete.id);
        const { error } = await supabase
            .from("participant")
            .delete()
            .eq("id", participantToDelete.id);
        setIsDeleting(null);

        if (error) {
            console.error(error);
            toast.error("Failed to delete participant.");
        } else {
            toast.success(
                `${participantToDelete.first_name} ${participantToDelete.last_name} was removed.`
            );
            router.refresh();
            if (onDelete) onDelete();
        }
        setParticipantToDelete(null);
    };

    const handleSort = (column: keyof ParticipantDisplay) => {
        if (sortColumn === column) {
            if (sortDirection === "asc") setSortDirection("desc");
            else if (sortDirection === "desc") {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const sortedParticipants = useMemo(() => {
        let col = sortColumn;
        let dir = sortDirection;
        if (!col || !dir) {
            col = "last_name";
            dir = "asc";
        }

        return [...participants].sort((a, b) => {
            const valA = a[col as keyof ParticipantDisplay];
            const valB = b[col as keyof ParticipantDisplay];

            if (typeof valA === "string" && typeof valB === "string") {
                return dir === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            if (typeof valA === "number" && typeof valB === "number") {
                return dir === "asc" ? valA - valB : valB - valA;
            }
            if (typeof valA === "boolean" && typeof valB === "boolean") {
                return dir === "asc"
                    ? valA === valB
                        ? 0
                        : valA
                          ? -1
                          : 1
                    : valA === valB
                      ? 0
                      : valA
                        ? 1
                        : -1;
            }
            const strA = String(valA ?? "");
            const strB = String(valB ?? "");
            return dir === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    }, [participants, sortColumn, sortDirection]);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {!readonly && <TableHead className="w-20"></TableHead>}
                        <SortableHeader
                            column="checked_in"
                            label="Checked In"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="display_id"
                            label="ID"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="first_name"
                            label="First Name"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="last_name"
                            label="Last Name"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="division"
                            label="Division"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="grade"
                            label="Grade"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="school"
                            label="School"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="team"
                            label="Team"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="chaperone"
                            label="Chaperone"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
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
                        sortedParticipants.map((p) => (
                            <TableRow key={p.id} className="group">
                                {!readonly && (
                                    <TableCell className="p-2">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TableButton title="Edit">
                                                <HiOutlinePencil
                                                    className="w-4 h-4"
                                                    onClick={() =>
                                                        redirect(
                                                            `/staff/participants/${p.id}`
                                                        )
                                                    }
                                                />
                                            </TableButton>
                                            <TableButton
                                                onClick={() => handleCheckIn(p)}
                                                title="Check In">
                                                <HiCheck className="w-4 h-4" />
                                            </TableButton>
                                            <TableButton
                                                onClick={() =>
                                                    handleDeleteClick(p)
                                                }
                                                disabled={isDeleting === p.id}
                                                title="Delete"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </TableButton>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell>
                                    {p.checked_in ? "Yes" : "No"}
                                </TableCell>
                                <TableCell>
                                    {readonly ? (
                                        p.display_id
                                    ) : (
                                        <Link
                                            href={`/staff/participants/${p.id}`}
                                            className="hover:underline text-red-600 hover:text-red-800">
                                            {p.display_id}
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell>{p.first_name}</TableCell>
                                <TableCell>{p.last_name}</TableCell>
                                <TableCell>{p.division}</TableCell>
                                <TableCell>{p.grade}</TableCell>
                                <TableCell>{p.school}</TableCell>
                                <TableCell>{p.team}</TableCell>
                                <TableCell>{p.chaperone}</TableCell>
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

            <Modal
                isOpen={!!participantToDelete}
                onClose={() => setParticipantToDelete(null)}
                title="Confirm Deletion"
                className="w-full max-w-md h-auto"
                footer={
                    <>
                        <ModalButton
                            variant="primary"
                            onClick={() => setParticipantToDelete(null)}
                            disabled={!!isDeleting}>
                            Cancel
                        </ModalButton>
                        <ModalButton
                            variant="themed"
                            onClick={confirmDelete}
                            disabled={!!isDeleting}
                            className="bg-red-600 hover:bg-red-700 ring-red-600 focus:ring-red-600">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </ModalButton>
                    </>
                }>
                <p className="text-gray-800">
                    Are you sure you want to completely remove{" "}
                    <strong>
                        {participantToDelete?.first_name}{" "}
                        {participantToDelete?.last_name}
                    </strong>
                    ?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    This action cannot be undone.
                </p>
            </Modal>
        </>
    );
}
