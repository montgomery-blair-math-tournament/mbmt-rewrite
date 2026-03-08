"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import Modal, { ModalButton } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { DIVISIONS } from "@/lib/constants/settings";
import { toast } from "sonner";
import { ParticipantDisplay } from "@/lib/schema/participant";

type TeamData = {
    id: number;
    name: string;
    school: string;
    division: number;
    displayId: string;
};

export default function EditParticipantModal({
    isOpen,
    onClose,
    onSuccess,
    participant,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    participant: ParticipantDisplay | null;
}) {
    const supabase = createClient();
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [manualId, setManualId] = useState("");
    const [manualFirst, setManualFirst] = useState("");
    const [manualLast, setManualLast] = useState("");
    const [manualGrade, setManualGrade] = useState("");
    const [manualTeamId, setManualTeamId] = useState("");

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen && participant) {
            setManualId(participant.display_id);
            setManualFirst(participant.first_name || "");
            setManualLast(participant.last_name || "");
            setManualGrade(
                participant.grade ? participant.grade.toString() : ""
            );

            if (participant.team_id && teams.length > 0) {
                const team = teams.find((t) => t.id === participant.team_id);
                if (team) {
                    setManualTeamId(team.displayId);
                } else {
                    setManualTeamId("");
                }
            } else {
                setManualTeamId("");
            }
        }
    }

    const participantTeamId = participant?.team_id;

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
                if (participantTeamId) {
                    const matchedTeam = formatted.find(
                        (t) => t.id === participantTeamId
                    );
                    if (matchedTeam) {
                        setManualTeamId(matchedTeam.displayId);
                    }
                }
            }
            setLoadingTeams(false);
        };

        fetchTeams();
    }, [isOpen, supabase, participantTeamId]);

    const handleClose = () => {
        setManualId("");
        setManualFirst("");
        setManualLast("");
        setManualGrade("");
        setManualTeamId("");
        onClose();
    };

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

    const handleSubmit = async () => {
        if (!participant) return;
        if (!manualId || !manualFirst || !manualLast || !manualGrade) {
            toast.error("Please fill out all required fields.");
            return;
        }

        const matchedTeam = manualTeamId ? validateTeamId(manualTeamId) : null;
        const idVal = validateParticipantId(manualId, matchedTeam);

        const gradeParsed = parseInt(manualGrade.trim(), 10);
        let error = idVal.error;
        if (!error && manualTeamId && !matchedTeam) {
            error = "Invalid Team ID";
        }
        if (!error && isNaN(gradeParsed)) {
            error = "Invalid Grade";
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
            first_name: manualFirst.trim(),
            last_name: manualLast.trim(),
            grade: gradeParsed,
            team_id: matchedTeam?.id || null,
        };

        const { error: updateError } = await supabase
            .from("participant")
            .update(toUpdate)
            .eq("id", participant.id);

        if (updateError) {
            console.error("Error updating participant:", updateError);
            toast.error(
                updateError.message ||
                    "An error occurred while updating the participant."
            );
        } else {
            toast.success("Successfully updated participant.");
            if (onSuccess) onSuccess();
            handleClose();
        }

        setIsSubmitting(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Edit Participant"
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
                        disabled={isSubmitting || loadingTeams}>
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
                        placeholder="e.g. A12"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        First Name
                    </label>
                    <Input
                        value={manualFirst}
                        onChange={(e) => setManualFirst(e.target.value)}
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        Last Name
                    </label>
                    <Input
                        value={manualLast}
                        onChange={(e) => setManualLast(e.target.value)}
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
                        onChange={(e) => setManualGrade(e.target.value)}
                        placeholder="10"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                        Team ID (Optional)
                    </label>
                    <Input
                        value={manualTeamId}
                        onChange={(e) =>
                            setManualTeamId(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. TA1 (leave blank if none)"
                    />
                </div>
            </div>
        </Modal>
    );
}
