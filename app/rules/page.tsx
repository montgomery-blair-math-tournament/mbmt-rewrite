import { MathJax, MathJaxContext } from "better-react-mathjax";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex flex-col gap-4 flex-1">
            <MathJaxContext>
                <h1 className="text-2xl font-bold font-sans">Official Rules</h1>
                <p>
                    Welcome to the eleventh annual Montgomery Blair Math
                    Tournament, or MBMT XI for short! MBMT is a free middle
                    school math contest that seeks to inspire students&apos;
                    interest in mathematics and to encourage them to explore
                    math beyond the school curriculum. Contest details can be
                    found on the{" "}
                    <Link
                        href="/info"
                        className="text-blue-600 hover:underline">
                        information page
                    </Link>
                    .
                </p>
                <h2 className="text-xl font-bold font-sans">Registration</h2>
                <ol className="list-decimal ml-4">
                    <li>
                        Participants in MBMT compete in teams of 5 (with some
                        exceptions, discussed further in #4). The math team
                        sponsors of each school/organization register individual
                        student teams through the website via the{" "}
                        <Link href="/register">registration page</Link>. There
                        is no limit to the number of full teams a school or
                        organization may send.
                    </li>
                    <li>
                        <b className="text-red-400">
                            Upper division (Weierstrass) only
                        </b>
                        : Subject Tests are specifically limited. The goal of
                        this policy is twofold: to make the subjects more
                        competitive and balanced, and to perhaps introduce other
                        topics of math not normally found in the classroom
                        setting.
                    </li>
                    <ol className="list-decimal ml-8">
                        <li>
                            Each Upper division (Weierstrass) team can have no
                            more than 3 tests per subject.
                        </li>
                        <li>
                            Lower division (Erdős) teams can select any
                            combination of subject tests.
                        </li>
                    </ol>

                    <li>
                        If there are fewer than 5 students interested in
                        participating, you may register incomplete teams. For an
                        incomplete team’s Team and Guts round scores to be
                        officially considered, incomplete teams must have{" "}
                        <b>at least 3 students</b>. Teams with one or two
                        students will be merged into larger teams.
                    </li>
                    <li>
                        We <b>do not</b> allow mixed-school or
                        mixed-organization teams. However, we do allow
                        organizations consisting of home-school groups, and
                        community activity groups, to name a few.
                    </li>
                    <li>
                        We <b>do not</b> allow elementary school students to
                        participate in MBMT.
                    </li>
                    <li>
                        <b>
                            Any school or organization with students in grades
                            6-8 can register and attend.
                        </b>
                    </li>
                </ol>
                <h2 className="text-xl font-bold font-sans">Round Format</h2>
                <ol className="list-decimal ml-4">
                    <li>
                        The <b>Individual round</b> consists of two tests, each
                        with eight questions and lasting thirty minutes.
                        Individual Tests are on two subjects among{" "}
                        <b>Algebra</b>, <b>Geometry</b>,{" "}
                        <b>Counting and Probability</b>, and{" "}
                        <b>Number Theory</b>.
                    </li>
                    <li>
                        The <b>Team round</b> contains fifteen questions for all
                        team members to collaboratively solve in 45 minutes.
                    </li>
                    <li>
                        The <b>Guts round</b> is an intense but exciting round
                        in which competing teams can see each others’ progress.
                        It is 60 minutes long, is graded live, and requires each
                        team to work together on progressively harder
                        five-problem sets. Each new set is worth more points
                        than the previous set.{" "}
                        <b>
                            <span className="dark:text-red-400">
                                Different divisions will have different Guts
                                round questions
                            </span>
                        </b>
                        . Note that there are{" "}
                        <b>no benefits of turning in the last set early</b>.
                        There are no bonus points for timing. Please also note
                        that{" "}
                        <b>
                            <span className="dark:text-red-400">
                                the weighting system for the later problems has
                                been tweaked
                            </span>
                        </b>{" "}
                        to more accurately reflect difficulty.
                    </li>
                    <li>
                        The <b>Fun round</b> is an exciting round consisting of
                        several separate mini-events, including puzzles, trivia,
                        and an estimation round. This round is purely for
                        enjoyment and
                        <b>
                            winners will not receive awards (though fun swag can
                            be won during Fun round)
                        </b>
                        .
                    </li>
                </ol>
                <h2 className="text-xl font-bold font-sans">
                    Important Notation
                </h2>
                <p>
                    Sequence notation: <MathJax>{"a_n"}</MathJax> denotes the{" "}
                    <MathJax>{"n"}</MathJax>th term of a sequence, where{" "}
                    <MathJax>{"n"}</MathJax> is a positive integer. For example,
                    in the sequence{" "}
                    <MathJax>{"1, 1, 2, 3, 5, \\ldots"}</MathJax>,{" "}
                    <MathJax>{"a_1=1, a_2=1, a_3=2, a_4=3"}</MathJax>, and so
                    on. Factorial notation: n! refers to the product of all
                    positive integers up through n. That is: n! =
                    n(n-1)(n-2)…(2)(1). For example, 4! = 4⋅3⋅2⋅1 = 24. Ordered
                    n-tuples: Certain questions will ask for an answer as an
                    ordered pair, ordered triple, or ordered 6-tuple. Ordered
                    pairs: (a, b) Ordered triples: (a, b, c) Ordered 6-tuples:
                    (a, b, c, d, e, f) a, b, c, etc. are numbers. Any answer in
                    the form of an ordered n-tuple MUST include the parentheses
                    and commas. Lines in geometry: if a question asks
                    &quot;compute AB&quot; or states that &quot;AB = 10&quot;,
                    this refers to the length of line AB or the distance between
                    the points A and B.
                </p>
                <h2 className="text-xl font-bold font-sans">
                    Important Terminology
                </h2>
                <p>
                    A circle is inscribed in a shape if it touches each side of
                    the shape at one point and is inside the shape. A circle
                    that is inscribed in a triangle is called the
                    triangle&apos;s incircle. A circle is circumscribed about a
                    shape if each vertex of the shape lies on the circle. A
                    circle that is circumscribed about a triangle is called the
                    triangle&apos;s circumcircle. The multiples of a number are
                    the positive numbers that divide into it evenly. For
                    example, the multiples of 3 are 3, 6, 9, 12, and so on. The
                    factors or divisors of a number are the positive numbers
                    that it divides into evenly. For example, the factors of 6
                    are 1, 2, 3, and 6. If two numbers or objects are selected
                    independently and at random, this means that they are
                    selected at random, and that how one is selected
                    doesn&apos;t affect how the other is selected. A real number
                    is a rational number or an irrational number. -1, 2.5, and π
                    are all real numbers. Unless you&apos;ve learned about
                    complex numbers, every number you know of is a real number.
                </p>
                <h2 className="text-xl font-bold font-sans">
                    Answering Questions
                </h2>
                <p>
                    For fractional answers whose numerator and denominator are
                    both integers, fractions should be written in simplified
                    form. We do not accept mixed fractions. Rationalizing
                    denominators is optional. For short finite decimals, we
                    accept both the fractional and the exact decimal form. For
                    infinite or long finite decimals, we strongly prefer the
                    fractional form. However, bar notation for repeating
                    infinite decimals is accepted. For questions requesting the
                    answer in terms of variables, use the variables as defined
                    in the problem. &quot;Divisors&quot; refers to positive
                    integral divisors unless otherwise specified. If a question
                    specifies an answer form, such as a + b*sqrt(2), please
                    adhere to the specified form. Further clarifications on
                    terminology, notation, and acceptable answer forms can be
                    found at{" "}
                    <a href="https://mbmt.mbhs.edu/static/files/Conventions.pdf">
                        the conventions document linked here.
                    </a>
                </p>
                <h2 className="text-xl font-bold font-sans">
                    Scoring and Awards
                </h2>
                <p>
                    A student’s overall individual score is the weighted sum of
                    the two subject tests that they have taken. The top 5
                    individuals in each division will be recognized, and the top
                    5 will receive medals. Students are ranked individually in
                    the four subject tests. The top individuals of each subject
                    test are recognized. These scores are calculated through a
                    method that accounts for test item difficulty and normalizes
                    the scores between tests. High-placement ties will be broken
                    using tiebreaker rounds. Tiebreaker rounds will be held
                    during the Fun Round. The team score is a weighted sum of
                    the Individual Round, Team Round, and Guts Round scores. The
                    top 5 teams in each division will be recognized. The highest
                    scoring 6th grade student in the Erdős (lower) division will
                    receive the Young Scholar Award. A more detailed guide to
                    the scoring algorithm we use can be found at{" "}
                    <a href="https://mbmt.mbhs.edu/static/files/Scoring.pdf">
                        the scoring document linked here.
                    </a>
                </p>
            </MathJaxContext>
        </div>
    );
}
