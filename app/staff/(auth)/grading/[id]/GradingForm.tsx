"use client";

import Heading from "@/components/Heading";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { Participant } from "@/lib/schema/participant";
import { Problem } from "@/lib/schema/problem";
import { ProblemResponse } from "@/lib/schema/problemResponse";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function GradingForm({
    type = "individual",
    roundId,
    problems,
}: {
    type?: "individual" | "team";
    roundId: number;
    problems: Problem[];
}) {
    const supabase = createClient();
    const [participantName, setParticipantName] = useState("");
    const [responses, setResponses] = useState<ProblemResponse[]>([]);
    const [responsesLoading, setResponsesLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data: problems, error: problemFetchError } = await supabase
                .from("problem")
                .select("*")
                .eq("round_id", roundId);
            if (problemFetchError) {
                setError(problemFetchError.message);
                console.error(problemFetchError);
                redirect("/staff/grading");
            }
            problems.sort((a, b) => a.number - b.number);
            setResponses(
                problems.map((problem) => ({ problem, response: "" }))
            );
            setResponsesLoading(false);
        })();
    }, [supabase]);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setParticipantName(participantName.trimEnd());
        console.log(responses);
        const {
            data: { user: staffData },
        } = await supabase.auth.getUser();
        if (!staffData) {
            redirect("/staff/login");
        }
        console.log(staffData);

        const participant = await findParticipantByName(participantName);
        if (!participant) {
            setError(`Participant ${participantName} not found.`);
            setLoading(false);
        } else {
            const { error: upsertError } = await supabase
                .from("participant_grading")
                .upsert(
                    responses.map((response) => ({
                        problem_id: response.problem.id,
                        participant_id: participant.id,
                        grader_id: staffData.id,
                        answer: response.response.trimEnd(),
                        is_correct:
                            response.response.trimEnd() ===
                            response.problem.answer,
                    }))
                );
            if (upsertError) {
                console.error(upsertError);
                setError(upsertError.message);
            }
            setLoading(false);
        }
    }

    async function findParticipantByName(
        name: string
    ): Promise<Participant | null> {
        const { data: participants, error: participantFetchError } =
            await supabase
                .from("participant")
                .select("*")
                .eq("first_name", name.split(" ")[0])
                .eq("last_name", name.split(" ")[1])
                .limit(1)
                .single();
        console.log(participants);
        if (participantFetchError) {
            console.error(participantFetchError);
        }
        return participants;
    }

    return (
        <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-sm mx-auto shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold">
                        Grade Test
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4">
                        {error && (
                            <div className="text-sm font-medium text-destructive text-center p-2 rounded bg-destructive/10">
                                {error}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="participant">Name</Label>
                            <Input
                                id="participant"
                                type="text"
                                required
                                value={participantName}
                                onChange={(e) => {
                                    setParticipantName(e.target.value);
                                }}
                                disabled={loading}
                            />
                        </div>
                        <p className="text-lg font-bold">Questions</p>
                        {problems.map((problem) => (
                            <div
                                key={problem.id}
                                className="flex flex-col gap-2">
                                <Label htmlFor={"problem" + problem.number}>
                                    {`Answer to problem ${problem.number}`}
                                </Label>
                                <Input
                                    id={"problem" + problem.number}
                                    type="text"
                                    required
                                    value={
                                        !responsesLoading
                                            ? responses[problem.number - 1]
                                                  .response
                                            : ""
                                    }
                                    disabled={loading}
                                    placeholder={problem.problem}
                                    onChange={(e) => {
                                        const newResponses =
                                            structuredClone(responses);
                                        newResponses[
                                            problem.number - 1
                                        ].response = e.target.value;
                                        setResponses(newResponses);
                                    }}
                                />
                            </div>
                        ))}
                        <Button
                            type="submit"
                            className="w-full bg-rose-900 hover:bg-rose-800 text-white"
                            disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
