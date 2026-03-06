"use client";

import { useState, useEffect, useMemo } from "react";
import { HiChevronUp, HiChevronDown, HiChevronUpDown } from "react-icons/hi2";
import { Problem } from "@/lib/schema/problem";
import { Round } from "@/lib/schema/round";
import { GradingStatus } from "@/lib/schema/score";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import GradingModal from "./GradingModal";
import ConflictResolutionModal from "./ConflictResolutionModal";
import ResetConfirmModal from "./ResetConfirmModal";
import AddToRoundModal from "./AddToRoundModal";
import { toast } from "sonner";

type GradingRow = {
    id: number;
    displayId: string;
    name: string;
    status: string;
    score: number | null;
    roundId: number;
};

const SortableHeader = ({
    column,
    label,
    currentSortColumn,
    currentSortDirection,
    onSort,
}: {
    column: keyof GradingRow;
    label: string;
    currentSortColumn: keyof GradingRow | null;
    currentSortDirection: "asc" | "desc" | null;
    onSort: (col: keyof GradingRow) => void;
}) => {
    const isActive = currentSortColumn === column;
    return (
        <TableHead>
            <button
                type="button"
                onClick={() => onSort(column)}
                className="w-full h-full cursor-pointer hover:bg-gray-100 transition-colors select-none text-left flex items-center px-0">
                <div className="flex items-center gap-1 group/header w-full h-full px-4">
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

export default function GradingClient({
    round,
    problems,
    targets,
}: {
    round: Round;
    problems: Problem[];
    targets: GradingRow[];
}) {
    const [search, setSearch] = useState("");
    const [gradingId, setGradingId] = useState<string>("");
    const [gradingItem, setGradingItem] = useState<GradingRow | null>(null);
    const [conflictItem, setConflictItem] = useState<GradingRow | null>(null);
    const [resetItem, setResetItem] = useState<GradingRow | null>(null);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [localTargets, setLocalTargets] = useState<GradingRow[]>(targets);

    const [sortColumn, setSortColumn] = useState<keyof GradingRow | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        null
    );

    useEffect(() => {
        setLocalTargets(targets);
    }, [targets]);

    const filteredTargets = localTargets.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.displayId.toLowerCase().includes(search.toLowerCase())
    );

    const handleSort = (column: keyof GradingRow) => {
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

    const sortedTargets = useMemo(() => {
        if (!sortColumn || !sortDirection) return [...filteredTargets];
        return [...filteredTargets].sort((a, b) => {
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
    }, [filteredTargets, sortColumn, sortDirection]);

    const type = round.type === "individual" ? "participant" : "team";

    const handleGradeById = () => {
        const trimmedId = gradingId.trim();
        const upperId = trimmedId.toUpperCase();
        const found = localTargets.find(
            (p) => p.displayId.toUpperCase() === upperId
        );
        if (found) {
            setGradingItem(found);
            setGradingId("");
        } else {
            toast.error(
                type === "team" ? "Team not found" : "Participant not found"
            );
        }
    };

    const handleConflictResolve = (
        id: number,
        status?: string,
        score?: number
    ) => {
        setLocalTargets((prev) =>
            prev.map((p) => {
                if (p.id === id) {
                    return {
                        ...p,
                        status: status ?? p.status,
                        score: score ?? p.score,
                    };
                }
                return p;
            })
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center border p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Input
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Enter ID"
                        value={gradingId}
                        onChange={(e) => setGradingId(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleGradeById()
                        }
                        className="w-full md:w-40"
                    />
                    <Button onClick={handleGradeById}>Grade</Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (!gradingId.trim()) {
                                toast.error("Please enter an ID");
                                return;
                            }
                            setAddingId(gradingId.trim());
                        }}>
                        Add to round
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableHeader
                                column="displayId"
                                label={type === "team" ? "Team ID" : "ID"}
                                currentSortColumn={sortColumn}
                                currentSortDirection={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="name"
                                label={type === "team" ? "Team Name" : "Name"}
                                currentSortColumn={sortColumn}
                                currentSortDirection={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="status"
                                label="Status"
                                currentSortColumn={sortColumn}
                                currentSortDirection={sortDirection}
                                onSort={handleSort}
                            />
                            <SortableHeader
                                column="score"
                                label="Score"
                                currentSortColumn={sortColumn}
                                currentSortDirection={sortDirection}
                                onSort={handleSort}
                            />
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTargets.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center py-8 text-muted-foreground">
                                    No{" "}
                                    {type === "team" ? "teams" : "participants"}{" "}
                                    found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedTargets.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        {p.displayId}
                                    </TableCell>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold
                                            ${
                                                p.status ===
                                                GradingStatus.COMPLETED
                                                    ? "bg-green-100 text-green-800"
                                                    : p.status ===
                                                        GradingStatus.CONFLICT
                                                      ? "bg-red-100 text-red-800"
                                                      : p.status ===
                                                          GradingStatus.IN_PROGRESS
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {p.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{p.score ?? "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setGradingItem(p)
                                                }>
                                                Grade
                                            </Button>
                                            {p.status ===
                                                GradingStatus.CONFLICT && (
                                                <Button
                                                    variant="secondary"
                                                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                    size="sm"
                                                    onClick={() =>
                                                        setConflictItem(p)
                                                    }>
                                                    Resolve
                                                </Button>
                                            )}
                                            {p.status !==
                                                GradingStatus.NOT_STARTED && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        setResetItem(p)
                                                    }>
                                                    Reset
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {gradingItem && (
                    <GradingModal
                        isOpen={!!gradingItem}
                        onClose={() => setGradingItem(null)}
                        type={type}
                        id={gradingItem.id}
                        displayId={gradingItem.displayId}
                        roundId={round.id}
                        targetName={gradingItem.name}
                        problems={problems}
                    />
                )}

                {conflictItem && (
                    <ConflictResolutionModal
                        isOpen={!!conflictItem}
                        onClose={() => setConflictItem(null)}
                        type={type}
                        id={conflictItem.id}
                        roundId={round.id}
                        problems={problems}
                        onResolve={(status, score) =>
                            handleConflictResolve(
                                conflictItem.id,
                                status,
                                score
                            )
                        }
                    />
                )}

                {resetItem && (
                    <ResetConfirmModal
                        isOpen={!!resetItem}
                        onClose={() => setResetItem(null)}
                        type={type}
                        id={resetItem.id}
                        roundId={round.id}
                        targetName={resetItem.name}
                    />
                )}

                {addingId && (
                    <AddToRoundModal
                        isOpen={!!addingId}
                        onClose={() => setAddingId(null)}
                        fullId={addingId}
                        roundId={round.id}
                        type={type}
                        onSuccess={() => setGradingId("")}
                    />
                )}
            </div>
        </div>
    );
}
