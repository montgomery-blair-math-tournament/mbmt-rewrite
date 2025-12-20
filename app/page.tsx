import Heading from "@/components/Heading";
import TitleCard from "@/components/TitleCard";

export default function Home() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <TitleCard />

            <div className="flex justify-between max-w-5/6 gap-12">
                <div>
                    <Heading level={2}>Solve problems.</Heading>
                    <b>MBMT is all about math.</b> Whether you&apos;re just a
                    beginner or a super Mathlete, you&apos;ll find interesting
                    and challenging math awaiting you at MBMT. We&apos;re
                    passionate about math, and we want to give you the best
                    competition experience possible.
                </div>
                <div>
                    <Heading level={2}>Work together.</Heading>
                    <b>Life is better in teams.</b> The competition is divided
                    into several <i>rounds</i>, during several of which you get
                    to work together with up to four other students to
                    collaborate to do math. You can help support each other and
                    make each other better competitors, as well as winning glory
                    for your school!
                </div>
                <div>
                    <Heading level={2}>Learn math.</Heading>
                    <b>Math is everywhere!</b> Mathematics is useful for
                    describing all sorts of things in our world, as well as all
                    sorts of things just in our brains. MBMT will help you
                    master all sorts of math skills, both for the real world and
                    for other math competitions.
                </div>
            </div>
        </div>
    );
}
