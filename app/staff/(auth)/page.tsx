import Heading from "@/components/Heading";
import Button from "@/components/ui/Button";

export default function StaffPage() {
    return (
        <div>
            <Heading level={1}>Staff Dashboard</Heading>
            <p>Welcome!</p>
            <div className="flex gap-4">
                <Button variant={"default"}>default</Button>
                <Button variant={"destructive"}>destructive</Button>
                <Button variant={"outline"}>outline</Button>
                <Button variant={"secondary"}>secondary</Button>
                <Button variant={"ghost"}>ghost</Button>
                <Button variant={"link"}>link</Button>
            </div>
        </div>
    );
}
