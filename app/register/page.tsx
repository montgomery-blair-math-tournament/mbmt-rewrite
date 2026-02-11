import Heading from "@/components/Heading";
import Link2 from "@/components/Link2";
import Main from "@/components/Main";
import RegistrationFormIframe from "@/components/RegistrationFormIframe";

export default function Page() {
    return (
        <Main>
            <Heading level={1}>Registration</Heading>
            <p>
                Welcome to MBMT 11, held on March 9, 2025! We highly encourage
                schools&apos; math team coaches or math resource department
                chairs to act as sponsors; however, any adult who is willing to
                supervise the team is fine.
                <br />
                {/* <Link2 href={process.env.NEXT_PUBLIC_FORM_LINK!}>
                    Click me to open the registration form...
                </Link2> */}
                Register below, or{" "}
                <Link2 href={process.env.NEXT_PUBLIC_FORM_LINK ?? "#"}>
                    open in a new tab
                </Link2>
                :
            </p>
            <div className="flex flex-1 justify-center">
                <RegistrationFormIframe />
            </div>
        </Main>
    );
}
