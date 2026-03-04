import Heading from "@/components/Heading";

export default function StaffPage() {
    return (
        <div className="flex flex-col gap-6">
            <Heading level={1}>Staff Dashboard</Heading>
            <div>
                <p>
                    Welcome! Feel free to play around with the different staff
                    pages until this Saturday. Report any issues with this
                    website on the discord server.
                </p>
            </div>
        </div>
    );
}
