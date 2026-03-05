"use client";

import { useState } from "react";
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

type StagedTeam = {
    tempId: string;
    rawId: string;
    parsedId: number;
    name: string;
    divisionCode: number | null;
    school: string;
    chaperone: string;
    isValid: boolean;
    validationError: string | null;
};

export default function AddTeamsModal({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const supabase = createClient();
    const [staged, setStaged] = useState<StagedTeam[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [manualId, setManualId] = useState("");
    const [manualName, setManualName] = useState("");
    const [manualDivisionStr, setManualDivisionStr] = useState("");
    const [manualSchool, setManualSchool] = useState("");
    const [manualChaperone, setManualChaperone] = useState("");

    const [csvText, setCsvText] = useState("");

    const [activeTab, setActiveTab] = useState<"manual" | "csv">("manual");

    const handleClose = () => {
        setStaged([]);
        setManualId("");
        setManualName("");
        setManualDivisionStr("");
        setManualSchool("");
        setManualChaperone("");
        setCsvText("");
        setActiveTab("manual");
        onClose();
    };

    const parseDivision = (divStr: string): number | null => {
        const lower = divStr.trim().toLowerCase();
        for (const [code, divInfo] of Object.entries(DIVISIONS)) {
            if (
                divInfo.name.toLowerCase() === lower ||
                divInfo.prefix.toLowerCase() === lower ||
                code === lower
            ) {
                return parseInt(code, 10);
            }
        }
        return null;
    };

    const validateTeamId = (rawId: string, divisionCode: number | null) => {
        const idUpper = rawId.trim().toUpperCase();

        if (!idUpper.startsWith("T")) {
            return {
                isValid: false,
                parsedId: 0,
                error: "ID must start with T",
            };
        }

        const idWithoutT = idUpper.substring(1);

        let expectedPrefix: string | null = null;
        if (divisionCode !== null && DIVISIONS[divisionCode]) {
            expectedPrefix = DIVISIONS[divisionCode].prefix.toUpperCase();
        }

        const validPrefixes = Object.values(DIVISIONS).map((d) =>
            d.prefix.toUpperCase()
        );
        const matchedPrefix = validPrefixes.find((p) =>
            idWithoutT.startsWith(p)
        );

        if (!matchedPrefix) {
            return {
                isValid: false,
                parsedId: 0,
                error: `Invalid Division Prefix`,
            };
        }

        if (expectedPrefix && matchedPrefix !== expectedPrefix) {
            return {
                isValid: false,
                parsedId: 0,
                error: `ID must contain ${expectedPrefix} for selected division`,
            };
        }

        const numStr = idWithoutT.substring(matchedPrefix.length);
        const parsed = parseInt(numStr, 10);

        if (isNaN(parsed)) {
            return { isValid: false, parsedId: 0, error: "Invalid ID Number" };
        }

        return { isValid: true, parsedId: parsed, error: null };
    };

    const handleAddManual = () => {
        if (!manualId || !manualName || !manualDivisionStr) {
            toast.error("Please fill out all required fields.");
            return;
        }

        const divisionCode = parseDivision(manualDivisionStr);
        const idVal = validateTeamId(manualId, divisionCode);

        let error = idVal.error;
        if (!error && divisionCode === null) {
            error = "Invalid Division";
        }

        const newStaged: StagedTeam = {
            tempId: Math.random().toString(36).substring(7),
            rawId: manualId.trim().toUpperCase(),
            parsedId: idVal.parsedId,
            name: manualName.trim(),
            divisionCode,
            school: manualSchool.trim(),
            chaperone: manualChaperone.trim(),
            isValid: idVal.isValid && divisionCode !== null,
            validationError: error,
        };

        setStaged((prev) => [...prev, newStaged]);
        setManualId("");
        setManualName("");
        setManualDivisionStr("");
        setManualSchool("");
        setManualChaperone("");
    };

    const handleParseCsv = () => {
        if (!csvText.trim()) return;

        const lines = csvText.split("\n");
        const parsed: StagedTeam[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split(",").map((p) => p.trim());
            if (parts.length >= 3) {
                const id = parts[0];
                const name = parts[1];
                const divisionStr = parts[2];
                const school = parts.length >= 4 ? parts[3] : "";
                const chaperone = parts.length >= 5 ? parts[4] : "";

                const parseId = id.toUpperCase();
                const divisionCode = parseDivision(divisionStr);
                const idVal = validateTeamId(parseId, divisionCode);

                let error = idVal.error;
                if (!error && divisionCode === null) {
                    error = "Invalid Division";
                }

                parsed.push({
                    tempId: Math.random().toString(36).substring(7),
                    rawId: parseId,
                    parsedId: idVal.parsedId,
                    name: name,
                    divisionCode,
                    school: school,
                    chaperone: chaperone,
                    isValid: idVal.isValid && divisionCode !== null,
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
            name: s.name,
            division: s.divisionCode as number,
            school: s.school,
            chaperone: s.chaperone || null,
        }));

        const { error } = await supabase.from("team").insert(toInsert);

        if (error) {
            console.error("Error inserting teams:", error);
            toast.error("An error occurred while adding teams.");
        } else {
            toast.success(`Successfully added ${toInsert.length} teams.`);
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
            title="Add Teams"
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
                        {isSubmitting ? "Adding..." : "Add Teams"}
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
                                    placeholder="e.g. TA12"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Name
                                </label>
                                <Input
                                    value={manualName}
                                    onChange={(e) =>
                                        setManualName(e.target.value)
                                    }
                                    placeholder="Mathletes"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Division
                                </label>
                                <Input
                                    value={manualDivisionStr}
                                    onChange={(e) =>
                                        setManualDivisionStr(e.target.value)
                                    }
                                    placeholder="Abel or Jacobi"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    School (Optional)
                                </label>
                                <Input
                                    value={manualSchool}
                                    onChange={(e) =>
                                        setManualSchool(e.target.value)
                                    }
                                    placeholder="Blair High School"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Chaperone (Optional)
                                </label>
                                <Input
                                    value={manualChaperone}
                                    onChange={(e) =>
                                        setManualChaperone(e.target.value)
                                    }
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <Button
                                onClick={handleAddManual}
                                className="mt-2 text-white">
                                Add to Staging
                            </Button>
                        </div>
                    )}

                    {activeTab === "csv" && (
                        <div className="flex flex-col gap-3 h-full">
                            <label className="text-xs font-semibold text-gray-600 uppercase">
                                Format: ID, Name, Division, School, Chaperone
                                (School & Chaperone are optional)
                            </label>
                            <textarea
                                className="flex-1 w-full min-h-[150px] p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                                placeholder={
                                    "TA12, Mathletes, Abel, Blair High School, Jane Doe\nTJ1, Number Ninjas, Jacobi, RM High School, John Doe"
                                }
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                            />
                            <Button
                                onClick={handleParseCsv}
                                className="mt-2 text-white">
                                Parse CSV
                            </Button>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-2/3 flex flex-col bg-white rounded-md border shadow-sm overflow-hidden min-h-[300px]">
                    <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                        <Heading level={3} className="text-lg font-medium">
                            Staged Teams ({staged.length})
                        </Heading>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Division</TableHead>
                                    <TableHead>School</TableHead>
                                    <TableHead>Chaperone</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staged.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8 text-muted-foreground h-40">
                                            No teams staged yet.
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
                                                {!s.isValid &&
                                                    s.validationError?.includes(
                                                        "ID"
                                                    ) && (
                                                        <div className="text-red-600 text-xs mt-0.5 font-medium">
                                                            {s.validationError}
                                                        </div>
                                                    )}
                                            </TableCell>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {s.name}
                                            </TableCell>
                                            <TableCell>
                                                {s.divisionCode !== null &&
                                                DIVISIONS[s.divisionCode] ? (
                                                    DIVISIONS[s.divisionCode]
                                                        .name
                                                ) : (
                                                    <span className="text-red-500 font-semibold">
                                                        Invalid
                                                    </span>
                                                )}
                                                {!s.isValid &&
                                                    s.validationError?.includes(
                                                        "Division"
                                                    ) && (
                                                        <div className="text-red-600 text-xs mt-0.5 font-medium">
                                                            {s.validationError}
                                                        </div>
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                {s.school || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {s.chaperone || "-"}
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
