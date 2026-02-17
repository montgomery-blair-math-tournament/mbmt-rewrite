"use client";

import Modal, { ModalButton } from "@/components/ui/Modal";
import { useState } from "react";
import { createRound } from "./actions";
import { DIVISIONS } from "@/lib/settings";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import Label from "@/components/ui/Label";

export default function CreateRoundModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [division, setDivision] = useState<number | null>(null);
    const [type, setType] = useState<string>("individual");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || division === null) {
            toast.error("Please fill in name and division");
            return;
        }

        setLoading(true);
        try {
            await createRound({ name, division, type });
            toast.success("Round created");
            setName("");
            setDivision(null);
            setType("individual");
            onClose();
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to create round: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Round"
            className="w-125 h-auto"
            footer={
                <>
                    <ModalButton onClick={onClose} variant="primary">
                        Cancel
                    </ModalButton>
                    <ModalButton
                        onClick={handleSubmit}
                        disabled={loading}
                        variant="themed">
                        {loading ? "Creating..." : "Create"}
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
                        placeholder="e.g. Algebra"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 outline-none sm:text-sm border p-2"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Division</Label>
                    <RadioGroup
                        value={division?.toString() || ""}
                        onValueChange={(val) => setDivision(parseInt(val))}>
                        {Object.entries(DIVISIONS).map(([key, div]) => (
                            <div key={key} className="flex items-center gap-2">
                                <RadioGroupItem
                                    value={key}
                                    id={`new-division-${key}`}
                                />
                                <Label htmlFor={`new-division-${key}`}>
                                    {div.name}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div>
                    <Label className="mb-2 block">Type</Label>
                    <RadioGroup value={type} onValueChange={setType}>
                        {["individual", "team", "guts"].map((t) => (
                            <div key={t} className="flex items-center gap-2">
                                <RadioGroupItem
                                    value={t}
                                    id={`new-type-${t}`}
                                />
                                <Label
                                    htmlFor={`new-type-${t}`}
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
