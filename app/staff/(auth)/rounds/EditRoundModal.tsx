"use client";

import Modal, { ModalButton } from "@/components/ui/Modal";
import { Round, RoundType } from "@/lib/schema/round";
import { useState } from "react";
import { updateRound } from "./[id]/actions";
import { DIVISIONS } from "@/lib/settings";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import Label from "@/components/ui/Label";

export default function EditRoundModal({
    round,
    isOpen,
    onClose,
}: {
    round: Round;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [name, setName] = useState(round.name);
    const [division, setDivision] = useState(round.division);
    const [type, setType] = useState<RoundType>(round.type);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await updateRound(round.id, { name, division, type });
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to update round");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Round: ${round.name}`}
            className="w-125 h-auto"
            footer={
                <>
                    <ModalButton
                        onClick={onClose}
                        variant="primary"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                        Cancel
                    </ModalButton>
                    <ModalButton
                        onClick={handleSubmit}
                        variant="themed"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 hover:cursor-pointer">
                        {loading ? "Saving..." : "Edit"}
                    </ModalButton>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div>
                    <Label className="mb-2 block">Name</Label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Division</Label>
                    <RadioGroup
                        value={division.toString()}
                        onValueChange={(val) => setDivision(parseInt(val))}>
                        {Object.entries(DIVISIONS).map(([key, div]) => (
                            <div key={key} className="flex items-center gap-2">
                                <RadioGroupItem
                                    value={key}
                                    id={`division-${key}`}
                                />
                                <Label htmlFor={`division-${key}`}>
                                    {div.name}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div>
                    <Label className="mb-2 block">Type</Label>
                    <RadioGroup
                        value={type}
                        onValueChange={(e) => setType(e as RoundType)}>
                        {["individual", "team", "guts"].map((t) => (
                            <div key={t} className="flex items-center gap-2">
                                <RadioGroupItem value={t} id={`type-${t}`} />
                                <Label
                                    htmlFor={`type-${t}`}
                                    className="capitalize">
                                    {t}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </div>
        </Modal>
    );
}
