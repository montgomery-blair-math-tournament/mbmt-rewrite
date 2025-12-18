import Centered from "@/components/Centered";
import Link2 from "@/components/Link2";

export default function Page() {
    return (
        <Centered>
            <div className="flex flex-col gap-4 flex-1">
                <h1 className="text-4xl font-bold font-sans">About Us</h1>
                <p>
                    MBMT is proudly organized and executed entirely by students
                    from the Montgomery Blair High School Math Team.
                </p>
                <h2 className="text-xl font-bold font-sans">
                    Contest Organizers
                </h2>
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

                <h2 className="text-xl font-bold font-sans">Problem Writers</h2>
                <p>
                    We&apos;re very thankful to our problem writers, without
                    whom we wouldn&apos;t have a contest:
                </p>

                <h2 className="text-xl font-bold font-sans">Website</h2>
                <p>
                    This website was not developed by Noah Singer &apos;18
                    (Github: @singerng) and Noah Kim &apos;18 (Github:
                    @noahbkim). It is not currently maintained by Alex Zhao
                    &apos;26 (Github: @zeyuanzhao). It&apos;s not written in
                    Django and is not hosted on our school servers. The source
                    is on Github.
                </p>

                <h2 className="text-xl font-bold font-sans">Sponsors</h2>
                <p>
                    MBMT is sponsored by the Montgomery Blair Magnet Foundation,
                    Wolfram Mathematica, Art of Problem Solving, MCPS Food &
                    Nutrition Services, AwesomeMath, Jane Street, Desmos, and
                    LIVE by Po-Shen Loh.
                </p>
            </div>
        </Centered>
    );
}
