import Main from "@/components/Main";
import pastTests, { PastTest } from "../../lib/constants/pastTests";
import Link2 from "@/components/Link2";
import Heading from "@/components/Heading";

export default function Page() {
    return (
        <Main>
            <Heading level={1}>Test Archive</Heading>
            <p>
                Here we&apos;re keeping all of past year&apos;s problems and
                solutions, as well as contest results. Some years might be
                missing a round since we haven&apos;t done every round every
                year. In each year, the more difficult division is listed
                second.
            </p>

            <table className="border-collapse w-fill">
                {/* header */}
                <thead>
                    <tr className="font-bold select-none bg-accent/50">
                        <td className="p-2">Year</td>
                        <td className="p-2">Division</td>
                        <td className="p-2">Algebra</td>
                        <td className="p-2">Geometry</td>
                        <td className="p-2">Counting</td>
                        <td className="p-2">Number Theory</td>
                        <td className="p-2">Team</td>
                        <td className="p-2">Guts</td>
                        <td className="p-2">Fun</td>
                    </tr>
                </thead>

                {/* per-year rows */}
                {pastTests.map((p) => (
                    <tbody
                        key={p.year}
                        className="odd:bg-gray-200 bg-gray-100 odd:hover:bg-accent/30 hover:bg-accent/30 transition-colors">
                        <tr>
                            <td
                                className="p-2 align-top"
                                rowSpan={p.divisions.length}>
                                {p.year}
                            </td>
                            <TableRow p={p} index={0} />
                            <td
                                className="p-2 align-top"
                                rowSpan={p.divisions.length}>
                                {p.funRound ? <FunRoundLink p={p} /> : "-"}
                            </td>
                        </tr>
                        {p.divisions.length == 2 && (
                            <tr>
                                <TableRow p={p} index={1} />
                            </tr>
                        )}
                    </tbody>
                ))}
            </table>
        </Main>
    );
}

function TableRow({ p, index }: { p: PastTest; index: number }) {
    const tests: string[] = [
        "algebra",
        "geometry",
        "counting",
        "nt",
        "team",
        "guts",
    ];

    const divisionName: string = p.divisions[index].toLowerCase();

    const testElements = tests.map((testName) => (
        <td key={`${p.year}/${divisionName}/${testName}`} className="p-2">
            {p.tests.includes(testName) ? (
                <div>
                    <Link2
                        href={`archive/${p.year}/${divisionName}/${testName}/problems.pdf`}>
                        Problems
                    </Link2>
                    <br />
                    <Link2
                        href={`archive/${p.year}/${divisionName}/${testName}/solutions.pdf`}>
                        Solutions
                    </Link2>
                </div>
            ) : (
                "-"
            )}
        </td>
    ));

    return (
        <>
            <td className="align-top p-2">{firstLetterCaps(divisionName)}</td>
            {testElements}
        </>
    );
}

function FunRoundLink({ p }: { p: PastTest }) {
    if (p.funRound == null) {
        return <div></div>;
    }

    return (
        <div>
            {p.funRound!.map((pdf) => (
                <div key={`${p.year}/fun/${pdf}`}>
                    <Link2 href={`/archive/${p.year}/fun/${pdf}.pdf`}>
                        {firstLetterCaps(pdf)}
                    </Link2>
                    <br />
                </div>
            ))}
        </div>
    );
}

function firstLetterCaps(s: string): string {
    if (s.length === 0) {
        return s;
    }

    return `${s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()}`;
}
