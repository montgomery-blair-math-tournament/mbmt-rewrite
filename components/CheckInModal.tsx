"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
    ParticipantDisplay,
    ParticipantDetail,
} from "@/lib/schema/participant";
import { Round } from "@/lib/schema/round";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CheckInModal({
    isOpen,
    onClose,
    participant,
}: {
    isOpen: boolean;
    onClose: () => void;
    participant: ParticipantDisplay | ParticipantDetail | null;
}) {
    const supabase = createClient();
    const [individualRounds, setIndividualRounds] = useState<Round[]>(() => {
        if (participant && "individualRounds" in participant) {
            return participant.individualRounds;
        }
        return [];
    });
    const [loadingRounds, setLoadingRounds] = useState(() => {
        return !!participant && !("individualRounds" in participant);
    });

    const onCheckIn = async () => {
        try {
            const { error } = await supabase
                .from("participant")
                .update({ checked_in: true })
                .eq("id", participant?.id);

            if (error) throw error;
        } catch (error) {
            console.error(error);
            toast.error("Failed to check in participant");
            return;
        }
        toast.success(
            `${participant?.firstName} ${participant?.lastName} checked in successfully`
        );
        onClose();
    };

    useEffect(() => {
        const fetchRounds = async () => {
            if (!participant || !isOpen) return;

            if ("individualRounds" in participant) {
                setIndividualRounds(participant.individualRounds);
                return;
            }
            setLoadingRounds(true);
            const { data: pRoundIds } = await supabase
                .from("participant_round")
                .select("round_id")
                .eq("participant_id", participant.id);

            const roundIds = pRoundIds?.map((x) => x.round_id) || [];

            if (roundIds.length > 0) {
                const { data: rounds } = await supabase
                    .from("round")
                    .select("id, name, division, type")
                    .in("id", roundIds);

                if (rounds) {
                    setIndividualRounds(rounds);
                } else {
                    setIndividualRounds([]);
                }
            } else {
                setIndividualRounds([]);
            }
            setLoadingRounds(false);
        };

        fetchRounds();
    }, [participant, isOpen, supabase]);

    if (!participant) return null;

    const roundList = individualRounds.map((r) => r.name).join(", ") || "None";
    const roundListContent = loadingRounds ? "Loading..." : roundList;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Check in for ${participant.firstName} ${participant.lastName}`}
            className="w-full max-w-2xl h-auto max-h-[90vh]"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={onCheckIn}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-800 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Check In
                    </button>
                </>
            }>
            <div className="space-y-6">
                <div>
                    <h3 className="text-rose-500 font-semibold mb-3">
                        Read and follow the script:
                    </h3>

                    <div className="space-y-4 text-base leading-relaxed text-gray-800">
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-900 p-3 rounded-md font-medium">
                            <p>
                                Confirm they are{" "}
                                <strong>
                                    {participant.firstName}{" "}
                                    {participant.lastName}
                                </strong>{" "}
                                from <strong>{participant.school}</strong> in
                                Grade <strong>{participant.grade}</strong>.
                            </p>
                        </div>

                        <p>
                            Your participant ID is{" "}
                            <strong>{participant.displayId}</strong> and your
                            team ID is{" "}
                            <strong>
                                T{participant.division[0]}
                                {participant.teamId}
                            </strong>
                            .
                        </p>

                        <p>
                            You are on <strong>{participant.team}</strong> in
                            the <strong>{participant.division}</strong>{" "}
                            division.
                        </p>

                        <p>
                            You will be taking the following individual rounds:{" "}
                            <strong>{roundListContent}</strong>.
                        </p>

                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-900 p-3 rounded-md font-medium">
                            <p>
                                Find{" "}
                                <strong>
                                    {participant.firstName}{" "}
                                    {participant.lastName}
                                </strong>
                                's sticker. Hand over welcome packet.
                            </p>
                        </div>

                        <p>
                            Please wear your sticker. It contains your table
                            numbers. You can use the map in the packet to find
                            your team table.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
