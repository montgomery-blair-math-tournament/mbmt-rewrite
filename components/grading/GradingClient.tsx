"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";

type ParticipantRow = {
    id: number;
    displayId: string;
    name: string;
    status: string;
    score: number | null;
    roundId: number;
};

type GradingClientProps = {
    round: Round;
    problems: Problem[];
    participants: ParticipantRow[];
};

export default function GradingClient({
    round,
    problems,
    participants,
}: GradingClientProps) {
    const [search, setSearch] = useState("");
    const [gradingId, setGradingId] = useState<string>("");

    const [gradingItem, setGradingItem] = useState<ParticipantRow | null>(null);
    const [conflictItem, setConflictItem] = useState<ParticipantRow | null>(
        null
    );
    const [resetItem, setResetItem] = useState<ParticipantRow | null>(null);

    const [localParticipants, setLocalParticipants] =
        useState<ParticipantRow[]>(participants);

    // Sync state when props change
    useEffect(() => {
        setLocalParticipants(participants);
    }, [participants]);

    const filteredParticipants = localParticipants.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.displayId.toLowerCase().includes(search.toLowerCase())
    );

    const type =
        round.type === "participant" || round.type === "individual"
            ? "participant"
            : "team";

    const handleGradeById = () => {
        const found = localParticipants.find(
            (p) => p.displayId === gradingId || p.id.toString() === gradingId
        );
        if (found) {
            setGradingItem(found);
            setGradingId("");
        } else {
            toast.error("Participant not found");
        }
    };

    const handleConflictResolve = (
        id: number,
        status?: string,
        score?: number
    ) => {
        setLocalParticipants((prev) =>
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm">
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
                        placeholder="Enter ID to Grade"
                        value={gradingId}
                        onChange={(e) => setGradingId(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleGradeById()
                        }
                        className="w-full md:w-40"
                    />
                    <Button onClick={handleGradeById}>Grade</Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredParticipants.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center py-8 text-muted-foreground">
                                    No participants found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredParticipants.map((p) => (
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
            </div>

            {gradingItem && (
                <GradingModal
                    isOpen={!!gradingItem}
                    onClose={() => setGradingItem(null)}
                    type={type}
                    id={gradingItem.id}
                    roundId={round.id}
                    participantName={gradingItem.name}
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
                        handleConflictResolve(conflictItem.id, status, score)
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
                    participantName={resetItem.name}
                />
            )}
        </div>
    );
}
