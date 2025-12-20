import Cell from "@/components/Cell";
import Main from "@/components/Main";
import Heading from "@/components/Heading";
import Image from "next/image";
import Link from "next/link";
import sponsorList from "../sponsorList";
import problemWriters from "../problemWriters";

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
                        <Cell>Mahilan Guha</Cell>
                        <Cell>Yunyi Ling</Cell>
                        <Cell>Michelle Gao</Cell>
                    </tr>
                    <tr>
                        <Cell>Evan Zhang</Cell>
                        <Cell>Reanna Jin</Cell>
                        <Cell>Alex Zhao</Cell>
                    </tr>
                    <tr>
                        <Cell>Kele Zhang</Cell>
                        <Cell>Ashley Zhang</Cell>
                        <Cell>Jesse Jing</Cell>
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
                This website was not developed by Noah Singer &apos;18 (Github:
                @singerng) and Noah Kim &apos;18 (Github: @noahbkim). It is not
                currently maintained by Alex Zhao &apos;26 (Github:
                @zeyuanzhao). It&apos;s not written in Django and is not hosted
                on our school servers. The source is on Github.
            </p>

            <Heading level={2}>Sponsors</Heading>
            <p>
                MBMT is sponsored by the Montgomery Blair Magnet Foundation,
                Wolfram Mathematica, Art of Problem Solving, MCPS Food &
                Nutrition Services, AwesomeMath, Jane Street, Desmos, and LIVE
                by Po-Shen Loh.
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
