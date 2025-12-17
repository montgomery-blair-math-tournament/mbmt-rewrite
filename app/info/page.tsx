import Centered from "@/components/Centered";
import { lower } from "@/divisions";
import Cell from "@/components/Cell";
import Link2 from "@/components/Link2";

export default function Page() {
    return (
        <Centered>
            <div className="flex flex-col gap-4 flex-1">
                <h1 className="text-2xl font-bold font-sans">
                    Contest Information
                </h1>
                <p>
                    <i>Last updated 12/17/2025</i>
                </p>
                <p>
                    MBMT is a free middle school math competition that seeks to
                    excite students’ interests in mathematics and in pursuing
                    mathematics beyond the school curriculum. We are pleased to
                    announce that, for the 2026 year, the Montgomery Blair Math
                    Team is hosting the 11th Montgomery Blair Math Tournament
                    (MBMT 11) on March 8th, 2026!
                </p>
                <h2 className="text-xl font-bold font-sans">Registration</h2>
                <p>
                    Registration will open on Wednesday, December 17th, 2025. We
                    would like all math team sponsors to register their teams by
                    Saturday, February 7th, 2026. This will help us estimate the
                    number of teams participating and assist us with logistics.
                    Please take note that if you don’t register by this date,
                    you might not receive our free swag. To register, visit{" "}
                    <Link2 href="/register">here</Link2>. For more details on
                    registration, see our{" "}
                    <Link2 href="/rules">Rules page</Link2>.
                </p>

                <h2 className="text-xl font-bold font-sans">Logistics</h2>
                <p>
                    MBMT 11 will occur at Montgomery Blair High School on
                    Sunday, March 8th, 2026 from 11:00 am - 5:00 pm. Our address
                    is{" "}
                    <Link2 href="https://goo.gl/maps/QUudw1ir4JPsHSL98">
                        51 University Blvd E, Silver Spring, MD 20901
                    </Link2>
                    . Please arrive on the University Boulevard side of the
                    school. Thanks to the generosity of the Montgomery County
                    Division of Food & Nutrition Services, FREE lunch will be
                    provided to all competitors and coaches. Coaches and
                    participants are invited to bring snacks for their own team.
                </p>

                <h2 className="text-xl font-bold font-sans">Contest</h2>
                <p>
                    MBMT consists of four rounds: Individual Round, Team Round,
                    Guts Round, and Fun Round. Both the Abel (lower) and Jacobi
                    (upper) divisions will take Individual Subject Tests (of
                    which students take two subjects among Algebra, Geometry,
                    Counting and Probability, and Number Theory). Each
                    Individual Subject Test consists of eight questions and
                    lasts thirty minutes.
                </p>
                <p>
                    The Team Round has fifteen questions for all team members to
                    collaboratively solve in forty-five minutes. The Guts Round
                    is an hour-long round that is graded live and requires team
                    members to work together on progressively harder
                    five-problem sets, each of which is worth more points than
                    the previous set. The Fun Round is an exciting round
                    consisting of several separate mini-events, including
                    puzzles, trivia, and an estimation round.
                </p>
                <p>
                    After hosting the tournament for several years, we have
                    worked hard to calibrate the accessibility and difficulty of
                    problems in both divisions. Our guiding philosophy is that
                    every participant in MBMT should find the rounds
                    approachable yet challenging.
                </p>
                <p>
                    Individual and team winners in each division will receive
                    medals or trophies! Team scores are calculated using Team
                    and Guts Round scores, combined with a weighted average of
                    individual scores, and teams with the highest scores in each
                    division win. The individual awards are for high-scoring
                    individuals overall and in each subject test. There are also
                    additional awards for high performance on the Guts Round.
                    Finally, we will also recognize the highest-scoring
                    6th-grade student in the {lower} Division.
                </p>

                <h2 className="text-xl font-bold font-sans">Schedule</h2>
                <table className="border-collapse w-fit">
                    <tbody>
                        <tr>
                            <Cell side="left">11:00 AM - 12:00 PM</Cell>
                            <Cell side="right">Registration + Lunch</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">12:15 - 12:45 PM</Cell>
                            <Cell side="right">Subject Test #1</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">12:55 - 1:25 PM</Cell>
                            <Cell side="right">Subject Test #2</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">1:25 - 1:40 PM</Cell>
                            <Cell side="right">Break</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">1:45 - 2:30 PM</Cell>
                            <Cell side="right">Team Round</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">2:40 - 3:40 PM</Cell>
                            <Cell side="right">Guts Round</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">3:40 - 4:20 PM</Cell>
                            <Cell side="right">Fun Round + Tiebreakers</Cell>
                        </tr>
                        <tr>
                            <Cell side="left">4:30 - 5:00 PM</Cell>
                            <Cell side="right">Awards Ceremony</Cell>
                        </tr>
                    </tbody>
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
