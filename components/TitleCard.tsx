import Link2 from "./Link2";
import MBMTLogo from "./MBMTLogo";

export default function TitleCard() {
    return (
        <div className="text-center mb-12 flex flex-col gap-6">
            <MBMTLogo />

            <div className="text-4xl font-extrabold text-center font-sans">
                The Montgomery Blair Math Tournament
            </div>

            <div className="text-center text-xl">
                A mathematics competition for middle school students in the
                Maryland area
                <br />
                Join us for MBMT 11 on March 8, 2026
                <span className="w-12"> </span>
                <Link2 href="/register">Register ❯</Link2>
            </div>
        </div>
    );
}
