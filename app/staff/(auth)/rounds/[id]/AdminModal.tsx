import HeaderButton from "@/components/HeaderButton";
import Modal from "@/components/ui/Modal";
import { Round } from "@/lib/schema/round";
import {
    calculateIndividualProblemWeightsByRound,
    calculateIndividualScoresOverall,
    calculateNormalizedScoresByRound,
} from "@/lib/services/scoring";
import { HiMiniCalculator } from "react-icons/hi2";
import { toast } from "sonner";

export default function AdminModal({
    round,
    isOpen,
    onClose,
}: {
    round: Round;
    isOpen: boolean;
    onClose: () => void;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Admin actions">
            <div className="flex flex-col gap-4 items-baseline">
                <HeaderButton
                    onClick={async () => {
                        try {
                            const numUpdatedWeights =
                                await calculateIndividualProblemWeightsByRound(
                                    round.id
                                );
                            toast.success(
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
                    weights (for this round)
                </HeaderButton>
                <HeaderButton
                    onClick={async () => {
                        try {
                            const numNormalizedIndividualScores =
                                await calculateNormalizedScoresByRound({
                                    roundId: round.id,
                                });
                            toast.success(
                                `Updated ${numNormalizedIndividualScores.size} normalized scores`
                            );
                        } catch (error) {
                            console.error(
                                `Error calculating normalized scores: ${error}`
                            );
                            toast.error("Error calculating normalized scores");
                        }
                    }}>
                    <HiMiniCalculator className="h-4 w-4" /> Calculate
                    normalized scores (for this round)
                </HeaderButton>
                <HeaderButton
                    onClick={async () => {
                        try {
                            const numCalculatedIndividualScores =
                                await calculateIndividualScoresOverall();
                            toast.success(
                                `Updated ${numCalculatedIndividualScores.size} individual scores`
                            );
                        } catch (error) {
                            console.error(
                                `Error calculating individual scores: ${error}`
                            );
                            toast.error("Error calculating individual scores");
                        }
                    }}>
                    <HiMiniCalculator className="h-4 w-4" /> Calculate
                    individual scores (ALL individual rounds)
                </HeaderButton>
            </div>
        </Modal>
    );
}
