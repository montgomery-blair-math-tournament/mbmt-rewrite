"use client";

import Heading from "@/components/Heading";
import { Round } from "@/lib/schema/round";
import { Problem } from "@/lib/schema/problem";
import HeaderButton from "@/components/HeaderButton";
import { HiMiniCalculator } from "react-icons/hi2";
import { calculateIndividualProblemWeights } from "./actions";
import { toast } from "sonner";

export type ProblemWeightMap = Map<
    Round,
    { problem: Problem; weight: number }[]
>;

export default function AdminPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Admin</Heading>
            </div>
            <div className="flex flex-col gap-4 justify-between items-baseline">
                <HeaderButton
                    onClick={async () => {
                        try {
                            const numUpdatedWeights =
                                await calculateIndividualProblemWeights();
                            console.log(
                                `Updated ${numUpdatedWeights} problem weights`
                            );
                        } catch (error) {
                            console.error(
                                `Error calculating weights: ${error}`
                            );
                            toast.error("Error calculating weights");
                        }
                    }}>
                    <HiMiniCalculator className="h-4 w-4" /> Calculate problem
                    weights (Individual rounds)
                </HeaderButton>
            </div>
        </div>
    );
}
