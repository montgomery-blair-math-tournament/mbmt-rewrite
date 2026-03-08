"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import Modal, { ModalButton } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import { toast } from "sonner";
import { TeamDisplay } from "@/lib/schema/team";

export default function EditTeamModal({
    isOpen,
    onClose,
    onSuccess,
    team,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    team: TeamDisplay | null;
}) {
    const supabase = createClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [manualId, setManualId] = useState("");
    const [manualName, setManualName] = useState("");
    const [manualDivisionStr, setManualDivisionStr] = useState("");
    const [manualSchool, setManualSchool] = useState("");
    const [manualChaperone, setManualChaperone] = useState("");

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen && team) {
            setManualId(team.displayId);
            setManualName(team.name || "");

            const divisionName = DIVISIONS[team.division]
                ? DIVISIONS[team.division].name
                : "";
            setManualDivisionStr(divisionName);

            setManualSchool(team.school || "");
            setManualChaperone(team.chaperone || "");
        }
    }

    const handleClose = () => {
        setManualId("");
        setManualName("");
        setManualDivisionStr("");
        setManualSchool("");
        setManualChaperone("");
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

    const handleSubmit = async () => {
        if (!team) return;

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

        if (error) {
            toast.error(error);
            return;
        }

        if (!idVal.isValid) {
            toast.error("Invalid ID configuration.");
            return;
        }

        setIsSubmitting(true);

        const toUpdate = {
            id: idVal.parsedId,
            name: manualName.trim(),
            division: divisionCode as number,
            school: manualSchool.trim(),
            chaperone: manualChaperone.trim() || null,
        };

        const { error: updateError } = await supabase
            .from("team")
            .update(toUpdate)
            .eq("id", team.id);

        if (updateError) {
            console.error("Error updating team:", updateError);
            toast.error(
                updateError.message ||
                    "An error occurred while updating the team."
            );
        } else {
            toast.success("Successfully updated team.");
            if (onSuccess) onSuccess();
            handleClose();
        }

        setIsSubmitting(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Edit Team"
            className="w-11/12 max-w-lg h-auto"
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
                        disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </ModalButton>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        ID
                    </label>
                    <Input
                        value={manualId}
                        onChange={(e) =>
                            setManualId(e.target.value.toUpperCase())
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
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Mathletes"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        Division
                    </label>
                    <Input
                        value={manualDivisionStr}
                        onChange={(e) => setManualDivisionStr(e.target.value)}
                        placeholder="Abel or Jacobi"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        School (Optional)
                    </label>
                    <Input
                        value={manualSchool}
                        onChange={(e) => setManualSchool(e.target.value)}
                        placeholder="Blair High School"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        Chaperone (Optional)
                    </label>
                    <Input
                        value={manualChaperone}
                        onChange={(e) => setManualChaperone(e.target.value)}
                        placeholder="Jane Doe"
                    />
                </div>
            </div>
        </Modal>
    );
}
