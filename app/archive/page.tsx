import Centered from "@/components/Centered";
import pastTests, { PastTest } from "./pastTests";
import Cell from "@/components/Cell";
import Link2 from "@/components/Link2";

export default function Page() {
    return (
        <Centered>
            <div className="flex flex-col gap-4 flex-1">
                <h1 className="text-4xl font-bold font-sans">Test Archive</h1>
                <p>
                    Here we&apos;re keeping all of past year&apos;s problems and
                    solutions, as well as contest results. Some years might be
                    missing a round since we haven&apos;t done every round every
                    year. In each year, the more difficult division is listed
                    second.
                </p>

                <table className="border-collapse w-fit py-4 align-top">
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
                    {pastTests.map((p) => {
                        return (
                            <tbody key={p.year}>
                                <tr>
                                    <TableRow p={p} index={0} />
                                    <Cell rowspan={2} className="align-top">
                                        {p.funRound ? (
                                            <div>
                                                {p.funRound.map((roundName) => {
                                                    return (
                                                        <div
                                                            key={
                                                                p.year +
                                                                "/" +
                                                                p.divisions[0] +
                                                                "/" +
                                                                roundName
                                                            }>
                                                            <Link2
                                                                href={`/static/tests/${p.year}/${p.divisions[0]}/team/${roundName}.pdf`}>
                                                                {roundName.toLowerCase()}
                                                            </Link2>
                                                            <br />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </Cell>
                                </tr>
                                <tr>
                                    <TableRow p={p} index={1} />
                                </tr>
                            </tbody>
                        );
                    })}
                </table>

                <h2 className="text-xl font-bold font-sans">Contact</h2>
                <p>
                    If you have any questions, please contact the Montgomery
                    Blair math team captains at{" "}
                    <Link2 href="mailto:mbhs.math.team@gmail.com">
                        mbhs.math.team@gmail.com
                    </Link2>
                    , or our coach, Jeremy Schwartz, at{" "}
                    <Link2 href="mailto:Jeremy_R_Schwartz@mcpsmd.org">
                        Jeremy_R_Schwartz@mcpsmd.org
                    </Link2>
                    . We look forward to seeing you and your Mathletes at this
                    year&apos;s MBMT!
                </p>
            </div>
        </Centered>
    );
}

function TableRow({ p, index }: { p: PastTest; index: number }) {
    return (
        <>
            <Cell className={"align-top"}>{p.year}</Cell>
            <Cell className={"align-top"}>{p.divisions[index]}</Cell>
            <Cell>
                {p.tests.includes("algebra") ? (
                    <div>
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/algebra/problems.pdf`}>
                            Problems
                        </Link2>
                        <br />
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/algebra/solutions.pdf`}>
                            Solutions
                        </Link2>
                    </div>
                ) : (
                    "-"
                )}
            </Cell>
            <Cell>
                {p.tests.includes("geometry") ? (
                    <div>
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/geometry/problems.pdf`}>
                            Problems
                        </Link2>
                        <br />
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/geometry/solutions.pdf`}>
                            Solutions
                        </Link2>
                    </div>
                ) : (
                    "-"
                )}
            </Cell>
            <Cell>
                {p.tests.includes("counting") ? (
                    <div>
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/counting/problems.pdf`}>
                            Problems
                        </Link2>
                        <br />
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/counting/solutions.pdf`}>
                            Solutions
                        </Link2>
                    </div>
                ) : (
                    "-"
                )}
            </Cell>
            <Cell>
                {p.tests.includes("nt") ? (
                    <div>
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/nt/problems.pdf`}>
                            Problems
                        </Link2>
                        <br />
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/nt/solutions.pdf`}>
                            Solutions
                        </Link2>
                    </div>
                ) : (
                    "-"
                )}
            </Cell>
            <Cell>
                {p.tests.includes("team") ? (
                    <div>
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/team/problems.pdf`}>
                            Problems
                        </Link2>
                        <br />
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/team/solutions.pdf`}>
                            Solutions
                        </Link2>
                    </div>
                ) : (
                    "-"
                )}
            </Cell>
            <Cell>
                {p.tests.includes("guts") ? (
                    <div>
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/guts/problems.pdf`}>
                            Problems
                        </Link2>
                        <br />
                        <Link2
                            href={`/static/tests/${p.year}/${p.divisions[index]}/guts/solutions.pdf`}>
                            Solutions
                        </Link2>
                    </div>
                ) : (
                    "-"
                )}
            </Cell>
        </>
    );
}
