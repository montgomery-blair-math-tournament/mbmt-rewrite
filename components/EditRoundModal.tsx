"use client";

import Modal from "@/components/ui/Modal";
import { Round } from "@/lib/schema/round";
import { useState } from "react";
import { updateRound } from "@/app/staff/(auth)/rounds/[id]/actions";
import { DIVISIONS } from "@/lib/settings";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import Label from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    const [type, setType] = useState(round.type);
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
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-rose-600 hover:bg-rose-700 text-white">
                        {loading ? "Saving..." : "Edit"}
                    </Button>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div>
                    <Label className="mb-2 block">Name</Label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Division</Label>
                    <RadioGroup
                        value={division.toString()}
                        onValueChange={(val) => setDivision(parseInt(val))}>
                        {Object.entries(DIVISIONS).map(([key, div]) => (
                            <div
                                key={key}
                                className="flex items-center space-x-2">
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
                    <RadioGroup value={type} onValueChange={setType}>
                        {["individual", "team", "guts"].map((t) => (
                            <div
                                key={t}
                                className="flex items-center space-x-2">
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
