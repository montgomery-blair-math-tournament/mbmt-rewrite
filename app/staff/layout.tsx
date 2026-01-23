import StaffNavbar from "@/components/StaffNavbar";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col">
            <StaffNavbar />
            <main className="flex flex-col flex-1 p-8">{children}</main>
        </div>
    );
}
