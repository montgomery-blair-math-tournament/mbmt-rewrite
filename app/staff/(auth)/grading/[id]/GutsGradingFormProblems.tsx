import { Problem } from "@/lib/schema/problem";

export default function GutsGradingForm2({
    problems,
}: {
    problems: Problem[];
}) {
    return <div>{JSON.stringify(problems)}</div>;
}
