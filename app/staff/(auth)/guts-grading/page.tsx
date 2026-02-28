import Heading from "@/components/Heading";
import GutsGradingForm from "./GutsGradingForm";

export default function GutsGradingPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Heading level={1}>Guts Grading</Heading>

                <GutsGradingForm />
            </div>
        </div>
    );
}
