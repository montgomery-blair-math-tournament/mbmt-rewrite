import Main from "@/components/Main";
import pastTests, { PastTest } from "../pastTests";
import Cell from "@/components/Cell";
import Link2 from "@/components/Link2";
import Heading from "@/components/Heading";

export default function Page() {
    const pastTestsElements = pastTests.map((p) => (
        <tbody
            key={p.year}
            className="odd:bg-gray-200 even:bg-gray-100 odd:dark:bg-gray-800 even:dark:bg-gray-900 duration-200 hover:bg-rose-200 dark:hover:bg-rose-900">
            <tr>
                <Cell rowspan={p.divisions.length}>{p.year}</Cell>
                <TableRow p={p} index={0} />
                <Cell rowspan={p.divisions.length}>
                    {p.funRound ? <FunRoundLink p={p} /> : "-"}
                </Cell>
            </tr>
            {p.divisions.length == 2 && (
                <tr>
                    <TableRow p={p} index={1} />
                </tr>
            )}
        </tbody>
    ));

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
                <thead className="border-b">
                    <tr className="font-bold">
                        <Cell>Year</Cell>
                        <Cell>Division</Cell>
                        <Cell>Algebra</Cell>
                        <Cell>Geometry</Cell>
                        <Cell>Counting</Cell>
                        <Cell>Number Theory</Cell>
                        <Cell>Team</Cell>
                        <Cell>Guts</Cell>
                        <Cell>Fun</Cell>
                    </tr>
                </thead>
                {pastTestsElements}
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

    const testElements = tests.map((pdf) => (
        <Cell key={`${p.year}/${divisionName}/${pdf}`}>
            {p.tests.includes(pdf) ? (
                <div>
                    <Link2
                        href={`archive/${p.year}/${divisionName}/${pdf}/problems.pdf`}>
                        Problems
                    </Link2>
                    <br />
                    <Link2
                        href={`archive/${p.year}/${divisionName}/${pdf}/solutions.pdf`}>
                        Solutions
                    </Link2>
                </div>
            ) : (
                "-"
            )}
        </Cell>
    ));

    return (
        <>
            <Cell>{firstLetterCaps(divisionName)}</Cell>
            {testElements}
        </>
    );
}

// Must check that p.funRound is non-null
function FunRoundLink({ p }: { p: PastTest }) {
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
