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
    HiOutlineTrash,
    HiChevronUp,
    HiChevronDown,
    HiChevronUpDown,
} from "react-icons/hi2";
import { TeamDisplay } from "@/lib/schema/team";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Modal, { ModalButton } from "@/components/ui/Modal";
import { DIVISIONS } from "@/lib/constants/settings";
import EditTeamModal from "@/app/staff/(auth)/teams/EditTeamModal";

const SortableHeader = ({
    column,
    label,
    currentSortColumn,
    currentSortDirection,
    onSort,
}: {
    column: keyof TeamDisplay;
    label: string;
    currentSortColumn: keyof TeamDisplay | null;
    currentSortDirection: "asc" | "desc" | null;
    onSort: (col: keyof TeamDisplay) => void;
}) => {
    const isActive = currentSortColumn === column;
    return (
        <TableHead>
            <button
                type="button"
                onClick={() => onSort(column)}
                className="w-full h-full cursor-pointer hover:bg-gray-100 transition-colors select-none text-left">
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
            </button>
        </TableHead>
    );
};

export default function TeamsTable({
    teams,
    loading,
    readonly = false,
    onDelete,
}: {
    teams: TeamDisplay[];
    loading: boolean;
    readonly?: boolean;
    onDelete?: () => void;
}) {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<TeamDisplay | null>(null);
    const [editingTeam, setEditingTeam] = useState<TeamDisplay | null>(null);
    const [sortColumn, setSortColumn] = useState<keyof TeamDisplay | null>(
        null
    );
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null
    );
    const router = useRouter();
    const supabase = createClient();

    const handleDeleteClick = (team: TeamDisplay) => {
        setTeamToDelete(team);
    };

    const confirmDelete = async () => {
        if (!teamToDelete) return;

        setIsDeleting(teamToDelete.id);
        const { error } = await supabase
            .from("team")
            .delete()
            .eq("id", teamToDelete.id);
        setIsDeleting(null);

        if (error) {
            console.error(error);
            toast.error("Failed to delete team.");
        } else {
            toast.success(`${teamToDelete.name} was removed.`);
            if (onDelete) {
                onDelete();
            } else {
                router.refresh();
            }
        }
        setTeamToDelete(null);
    };

    const handleSort = (column: keyof TeamDisplay) => {
        if (sortColumn === column) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const sortedTeams = useMemo(() => {
        if (!sortColumn || !sortDirection) return [...teams];
        return [...teams].sort((a, b) => {
            const valA = a[sortColumn];
            const valB = b[sortColumn];

            if (typeof valA === "string" && typeof valB === "string") {
                return sortDirection === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            if (typeof valA === "number" && typeof valB === "number") {
                return sortDirection === "asc" ? valA - valB : valB - valA;
            }
            const strA = String(valA ?? "");
            const strB = String(valB ?? "");
            return sortDirection === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    }, [teams, sortColumn, sortDirection]);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {!readonly && <TableHead className="w-20"></TableHead>}
                        <SortableHeader
                            column="displayId"
                            label="ID"
                            currentSortColumn={sortColumn}
                            currentSortDirection={sortDirection}
                            onSort={handleSort}
                        />
                        <SortableHeader
                            column="name"
                            label="Name"
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
                            column="chaperone"
                            label="Chaperone"
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
                            column="size"
                            label="Participants"
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
                                colSpan={readonly ? 6 : 7}
                                className="text-center h-24">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : teams.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={readonly ? 6 : 7}
                                className="text-center h-24">
                                No teams found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedTeams.map((t) => (
                            <TableRow key={t.id} className="group">
                                {!readonly && (
                                    <TableCell className="p-2">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TableButton title="Edit">
                                                <HiOutlinePencil
                                                    className="w-4 h-4"
                                                    onClick={() =>
                                                        setEditingTeam(t)
                                                    }
                                                />
                                            </TableButton>
                                            <TableButton
                                                onClick={() =>
                                                    handleDeleteClick(t)
                                                }
                                                disabled={isDeleting === t.id}
                                                title="Delete"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </TableButton>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell>
                                    {readonly ? (
                                        t.displayId
                                    ) : (
                                        <Link
                                            href={`/staff/teams/${t.id}`}
                                            className="hover:underline text-red-600 hover:text-red-800">
                                            {t.displayId}
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell>{t.name}</TableCell>
                                <TableCell>{t.school || "-"}</TableCell>
                                <TableCell>{t.chaperone || "-"}</TableCell>
                                <TableCell>
                                    {DIVISIONS[t.division]?.name || t.division}
                                </TableCell>
                                <TableCell>{t.size}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <EditTeamModal
                isOpen={!!editingTeam}
                onClose={() => setEditingTeam(null)}
                team={editingTeam}
                onSuccess={() => {
                    if (onDelete) {
                        onDelete();
                    } else {
                        router.refresh();
                    }
                }}
            />

            <Modal
                isOpen={!!teamToDelete}
                onClose={() => setTeamToDelete(null)}
                title="Confirm Deletion"
                className="w-full max-w-md h-auto"
                footer={
                    <>
                        <ModalButton
                            variant="primary"
                            onClick={() => setTeamToDelete(null)}
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
                    <strong>{teamToDelete?.name}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    This action cannot be undone. All participants under this
                    team need to be handled.
                </p>
            </Modal>
        </>
    );
}
