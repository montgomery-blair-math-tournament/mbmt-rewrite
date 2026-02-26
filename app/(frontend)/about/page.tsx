import Main from "@/components/Main";
import Heading from "@/components/Heading";
import Image from "next/image";
import Link from "next/link";
import sponsorList from "../../../lib/sponsorList";
import problemWriters from "../../../lib/problemWriters";
import Link2 from "@/components/Link2";

export default function Page() {
    return (
        <Main>
            <Heading level={1}>About Us</Heading>

            <p>
                MBMT is proudly organized and executed entirely by students from
                the Montgomery Blair High School Math Team.
            </p>

            <Heading level={2}>Contest Organizers</Heading>
            <table className="text-center text-xl">
                <tbody>
                    <tr>
                        <td className="text-xl pb-2">Mahilan Guha</td>
                        <td className="text-xl pb-2">Yunyi Ling</td>
                        <td className="text-xl pb-2">Michelle Gao</td>
                    </tr>
                    <tr>
                        <td className="text-xl pb-2">Evan Zhang</td>
                        <td className="text-xl pb-2">Reanna Jin</td>
                        <td className="text-xl pb-2">Alex Zhao</td>
                    </tr>
                    <tr>
                        <td className="text-xl pb-2">Kele Zhang</td>
                        <td className="text-xl pb-2">Ashley Zhang</td>
                        <td className="text-xl pb-2">Jesse Jing</td>
                    </tr>
                </tbody>
            </table>

            <Heading level={2}>Problem Writers</Heading>
            <p>
                We&apos;re very thankful to our problem writers, without whom we
                wouldn&apos;t have a contest:
            </p>
            <ul className="columns-5 text-center">
                {Array.from({ length: problemWriters.length }).map((_, i) => (
                    <li key={i}>{problemWriters[i]}</li>
                ))}
            </ul>

            <Heading level={2}>Website</Heading>
            <p>
                This website was developed by Alex Zhao &apos;26 (Github:
                @zeyuanzhao) and Kiran Oliver &apos;28 (Github: @penguen01). A
                large portion of the content on these webpages was written by
                Noah Singer &apos;18 (Github: @singerng) and Noah Kim &apos;18
                (Github: @noahbkim). Both this website and the grading server
                are hosted on <Link2 href="https://vercel.com">Vercel</Link2>.{" "}
                The code is not currently on GitHub, but will be in the future.
            </p>

            <Heading level={2}>Sponsors</Heading>
            <p>
                MBMT is sponsored by the Montgomery Blair Magnet Foundation,
                Hudson River Trading, Art of Problem Solving, Wolfram, Jane
                Street, MCPS Food & Nutrition Services, AwesomeMath, Jump
                Trading, and Citadel/Citadel Securities.
            </p>
            <div className="flex flex-wrap justify-around gap-2 items-center">
                {sponsorList.map(({ name, image, link, width }) => (
                    <Link key={name} href={link} className="h-fit bg-white">
                        <Image src={image} alt={`${name} logo`} width={width} />
                    </Link>
                ))}
            </div>
        </Main>
    );
}
