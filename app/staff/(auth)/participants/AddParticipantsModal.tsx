"use client";

import { useState, useEffect } from "react";
import Heading from "@/components/Heading";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal, { ModalButton } from "@/components/ui/Modal";
import Table, {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import { toast } from "sonner";
import { HiOutlineTrash } from "react-icons/hi2";

type TeamData = {
    id: number;
    name: string;
    school: string;
    division: number;
    displayId: string;
};

type StagedParticipant = {
    tempId: string;
    rawId: string;
    parsedId: number;
    firstName: string;
    lastName: string;
    grade: string;
    rawTeamId: string;
    matchedTeam: TeamData | null;
    isValid: boolean;
    validationError: string | null;
};

export default function AddParticipantsModal({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const supabase = createClient();
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    const [staged, setStaged] = useState<StagedParticipant[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manual Entry State
    const [manualId, setManualId] = useState("");
    const [manualFirst, setManualFirst] = useState("");
    const [manualLast, setManualLast] = useState("");
    const [manualGrade, setManualGrade] = useState("");
    const [manualTeamId, setManualTeamId] = useState("");

    // CSV Entry State
    const [csvText, setCsvText] = useState("");

    // Tabs
    const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

    const handleClose = () => {
        setStaged([]);
        setManualId("");
        setManualFirst("");
        setManualLast("");
        setManualGrade("");
        setManualTeamId("");
        setCsvText("");
        setActiveTab("manual");
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchTeams = async () => {
            setLoadingTeams(true);
            const { data, error } = await supabase
                .from("team")
                .select("id, name, school, division");

            if (error) {
                console.error("Error fetching teams:", error);
                toast.error("Failed to fetch teams.");
            } else {
                const formatted = (data || []).map((t) => {
                    const divisionInfo = DIVISIONS[t.division] || DIVISIONS[0];
                    return {
                        ...t,
                        displayId: `T${divisionInfo.prefix}${t.id}`,
                    };
                });
                setTeams(formatted);
            }
            setLoadingTeams(false);
        };

        fetchTeams();
    }, [isOpen, supabase]);

    const validateTeamId = (rawId: string) => {
        const upper = rawId.trim().toUpperCase();
        return teams.find((t) => t.displayId.toUpperCase() === upper) || null;
    };

    const validateParticipantId = (rawId: string, team: TeamData | null) => {
        const idUpper = rawId.trim().toUpperCase();

        let expectedPrefix: string | null = null;
        if (team) {
            expectedPrefix = (
                DIVISIONS[team.division] || DIVISIONS[0]
            ).prefix.toUpperCase();
        }

        const validPrefixes = Object.values(DIVISIONS).map((d) =>
            d.prefix.toUpperCase()
        );
        const matchedPrefix = validPrefixes.find((p) => idUpper.startsWith(p));

        if (!matchedPrefix) {
            return {
                isValid: false,
                parsedId: 0,
                error: `Invalid ID`,
            };
        }

        if (expectedPrefix && matchedPrefix !== expectedPrefix) {
            return {
                isValid: false,
                parsedId: 0,
                error: `ID must start with ${expectedPrefix}`,
            };
        }

        const numStr = idUpper.substring(matchedPrefix.length);
        const parsed = parseInt(numStr, 10);

        if (isNaN(parsed)) {
            return { isValid: false, parsedId: 0, error: "Invalid ID Number" };
        }

        return { isValid: true, parsedId: parsed, error: null };
    };

    const handleAddManual = () => {
        if (
            !manualId ||
            !manualFirst ||
            !manualLast ||
            !manualGrade ||
            !manualTeamId
        ) {
            toast.error("Please fill out all fields.");
            return;
        }

        const matchedTeam = validateTeamId(manualTeamId);
        const idVal = validateParticipantId(manualId, matchedTeam);

        const gradeParsed = parseInt(manualGrade.trim(), 10);
        let error = idVal.error;
        if (!error && !matchedTeam) {
            error = "Invalid Team";
        }
        if (!error && isNaN(gradeParsed)) {
            error = "Invalid Grade";
        }

        const newStaged: StagedParticipant = {
            tempId: Math.random().toString(36).substring(7),
            rawId: manualId.trim().toUpperCase(),
            parsedId: idVal.parsedId,
            firstName: manualFirst.trim(),
            lastName: manualLast.trim(),
            grade: manualGrade.trim(),
            rawTeamId: manualTeamId.trim().toUpperCase(),
            matchedTeam,
            isValid:
                matchedTeam !== null && idVal.isValid && !isNaN(gradeParsed),
            validationError: error,
        };

        setStaged((prev) => [...prev, newStaged]);
        setManualId("");
        setManualFirst("");
        setManualLast("");
        setManualGrade("");
        setManualTeamId("");
    };

    const handleParseCsv = () => {
        if (!csvText.trim()) return;

        const lines = csvText.split("\n");
        const parsed: StagedParticipant[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            // Expected format: ID, FirstName, LastName, Grade, TeamId
            const parts = line.split(",").map((p) => p.trim());
            if (parts.length >= 5) {
                const [id, first, last, grade, teamId] = parts;
                const parseId = id.toUpperCase();
                const parseTeamId = teamId.toUpperCase();
                const matchedTeam = validateTeamId(parseTeamId);
                const idVal = validateParticipantId(parseId, matchedTeam);

                const gradeParsed = parseInt(grade, 10);
                let error = idVal.error;
                if (!error && !matchedTeam) {
                    error = "Invalid Team";
                }
                if (!error && isNaN(gradeParsed)) {
                    error = "Invalid Grade";
                }

                parsed.push({
                    tempId: Math.random().toString(36).substring(7),
                    rawId: parseId,
                    parsedId: idVal.parsedId,
                    firstName: first,
                    lastName: last,
                    grade: grade,
                    rawTeamId: parseTeamId,
                    matchedTeam,
                    isValid:
                        matchedTeam !== null &&
                        idVal.isValid &&
                        !isNaN(gradeParsed),
                    validationError: error,
                });
            } else {
                toast.error(`Invalid CSV line: ${line}`);
            }
        }

        setStaged((prev) => [...prev, ...parsed]);
        setCsvText("");
    };

    const handleRemoveStaged = (tempId: string) => {
        setStaged((prev) => prev.filter((s) => s.tempId !== tempId));
    };

    const handleSubmit = async () => {
        if (staged.length === 0) return;

        const invalidRows = staged.filter((s) => !s.isValid);
        if (invalidRows.length > 0) {
            toast.error("Please fix invalid items before adding.");
            return;
        }

        setIsSubmitting(true);

        const toInsert = staged.map((s) => ({
            id: s.parsedId,
            first_name: s.firstName,
            last_name: s.lastName,
            grade: parseInt(s.grade, 10),
            team_id: s.matchedTeam!.id,
            checked_in: false,
        }));

        const { error } = await supabase.from("participant").insert(toInsert);

        if (error) {
            console.error("Error inserting participants:", error);
            toast.error("An error occurred while adding participants.");
        } else {
            toast.success(
                `Successfully added ${toInsert.length} participants.`
            );
            if (onSuccess) onSuccess();
            handleClose();
        }

        setIsSubmitting(false);
    };

    const allValid = staged.length > 0 && staged.every((s) => s.isValid);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Participants"
            className="w-11/12 max-w-4xl h-[80vh]"
            footer={
                <>
                    <ModalButton
                        variant="primary"
                        onClick={handleClose}
                        disabled={isSubmitting}>
                        Cancel
                    </ModalButton>
                    <ModalButton
                        variant="themed"
                        onClick={handleSubmit}
                        disabled={
                            !allValid || isSubmitting || staged.length === 0
                        }>
                        {isSubmitting ? "Adding..." : "Add Participants"}
                    </ModalButton>
                </>
            }>
            <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Left Column: Input Forms */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="flex gap-2 border-b">
                        <button
                            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                                activeTab === "manual"
                                    ? "border-accent text-accent"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setActiveTab("manual")}>
                            Manual Entry
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                                activeTab === "csv"
                                    ? "border-accent text-accent"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setActiveTab("csv")}>
                            Paste CSV
                        </button>
                    </div>

                    {activeTab === "manual" && (
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    ID
                                </label>
                                <Input
                                    value={manualId}
                                    onChange={(e) =>
                                        setManualId(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="e.g. A12"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    First Name
                                </label>
                                <Input
                                    value={manualFirst}
                                    onChange={(e) =>
                                        setManualFirst(e.target.value)
                                    }
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Last Name
                                </label>
                                <Input
                                    value={manualLast}
                                    onChange={(e) =>
                                        setManualLast(e.target.value)
                                    }
                                    placeholder="Doe"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Grade (Number)
                                </label>
                                <Input
                                    type="number"
                                    value={manualGrade}
                                    onChange={(e) =>
                                        setManualGrade(e.target.value)
                                    }
                                    placeholder="10"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Team ID
                                </label>
                                <Input
                                    value={manualTeamId}
                                    onChange={(e) =>
                                        setManualTeamId(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="e.g. TA1"
                                />
                            </div>
                            <Button
                                onClick={handleAddManual}
                                disabled={loadingTeams}
                                className="mt-2 text-white">
                                Add to Staging
                            </Button>
                        </div>
                    )}

                    {activeTab === "csv" && (
                        <div className="flex flex-col gap-3 h-full">
                            <label className="text-xs font-semibold text-gray-600 uppercase">
                                Format: ID, FirstName, LastName, Grade, TeamId
                            </label>
                            <textarea
                                className="flex-1 w-full min-h-[150px] p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                                placeholder={
                                    "A12, John, Doe, 10, TA1\nJ1, Jane, Smith, 11, TJ2"
                                }
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                            />
                            <Button
                                onClick={handleParseCsv}
                                disabled={loadingTeams}
                                className="mt-2 text-white">
                                Parse CSV
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right Column: Staging Table */}
                <div className="w-full md:w-2/3 flex flex-col bg-white rounded-md border shadow-sm overflow-hidden min-h-[300px]">
                    <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                        <Heading level={3} className="text-lg font-medium">
                            Staged Participants ({staged.length})
                        </Heading>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>First Name</TableHead>
                                    <TableHead>Last Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Division</TableHead>
                                    <TableHead>Team ID</TableHead>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staged.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-8 text-muted-foreground h-40">
                                            No participants staged yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    staged.map((s) => (
                                        <TableRow
                                            key={s.tempId}
                                            className={
                                                !s.isValid ? "bg-red-50/50" : ""
                                            }>
                                            <TableCell
                                                className={`font-medium whitespace-nowrap ${s.validationError?.includes("ID") ? "text-red-500" : ""}`}>
                                                {s.rawId}
                                            </TableCell>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {s.firstName}
                                            </TableCell>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {s.lastName}
                                            </TableCell>
                                            <TableCell>{s.grade}</TableCell>
                                            <TableCell>
                                                {s.matchedTeam
                                                    ? (
                                                          DIVISIONS[
                                                              s.matchedTeam
                                                                  .division
                                                          ] || DIVISIONS[0]
                                                      ).name
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {s.matchedTeam ? (
                                                    <span className="font-semibold">
                                                        {
                                                            s.matchedTeam
                                                                .displayId
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 font-semibold">
                                                        {s.rawTeamId}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {s.matchedTeam ? (
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {s.matchedTeam.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                s.matchedTeam
                                                                    .school
                                                            }
                                                        </span>
                                                        {!s.isValid && (
                                                            <span className="text-red-600 text-xs mt-0.5 font-medium">
                                                                {s.validationError ||
                                                                    "Invalid"}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-red-600 text-sm font-medium">
                                                        {s.validationError ||
                                                            "Invalid"}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() =>
                                                        handleRemoveStaged(
                                                            s.tempId
                                                        )
                                                    }
                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                                                    title="Remove">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
