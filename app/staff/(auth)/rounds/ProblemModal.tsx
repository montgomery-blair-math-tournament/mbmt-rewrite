"use client";

import Modal, { ModalButton } from "@/components/ui/Modal";
import { Problem } from "@/lib/schema/problem";
import { useState, useEffect } from "react";
import { upsertProblem } from "./[id]/actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import Label from "@/components/ui/Label";
import { toast } from "sonner";

export default function ProblemModal({
    problem,
    roundId,
    isOpen,
    onClose,
}: {
    problem?: Problem;
    roundId: number;
    isOpen: boolean;
    onClose: () => void;
}) {
    const isEditing = !!problem;

    const [number, setNumber] = useState(0);
    const [type, setType] = useState("boolean");
    const [probText, setProbText] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (problem) {
                setNumber(problem.number);
                setType(problem.type);
                setProbText(problem.problem);
                setAnswer(problem.answer);
            } else {
                setNumber(0);
                setType("boolean");
                setProbText("");
                setAnswer("");
            }
        }
    }, [isOpen, problem]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data: Partial<Problem> = {
                round_id: roundId,
                number,
                type,
                problem: probText,
                answer,
            };

            if (isEditing && problem) {
                data.id = problem.id;
            }

            await upsertProblem(data);
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save problem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Edit Problem" : "Add Problem"}
            className="w-150 h-auto"
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
                        {loading ? "Saving..." : isEditing ? "Edit" : "Add"}
                    </ModalButton>
                </>
            }>
            <div className="flex flex-col gap-4">
                <div>
                    <Label className="mb-2 block">Number</Label>
                    <input
                        type="number"
                        min={1}
                        value={number}
                        onChange={(e) => setNumber(parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                        placeholder="e.g. 1"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Type</Label>
                    <RadioGroup value={type} onValueChange={setType}>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="boolean"
                                id="ptype-boolean"
                            />
                            <Label htmlFor="ptype-boolean">
                                Correct/Incorrect
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="custom" id="ptype-custom" />
                            <Label htmlFor="ptype-custom">Custom</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div>
                    <Label className="mb-2 block">Problem</Label>
                    <textarea
                        value={probText}
                        onChange={(e) => setProbText(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                        placeholder="Problem statement (LaTeX supported)"
                    />
                </div>

                <div>
                    <Label className="mb-2 block">Answer</Label>
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                        placeholder="Answer (LaTeX supported)"
                    />
                </div>
            </div>
        </Modal>
    );
}
