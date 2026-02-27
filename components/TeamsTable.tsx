import Table, {
    TableBody,
    TableButton,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { HiOutlinePencil } from "react-icons/hi2";
import { TeamDisplay } from "@/lib/schema/team";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function TeamsTable({
    teams,
    loading,
}: {
    teams: TeamDisplay[];
    loading: boolean;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-20"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Chaperone</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Participants</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                            Loading...
                        </TableCell>
                    </TableRow>
                ) : teams.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                            No teams found.
                        </TableCell>
                    </TableRow>
                ) : (
                    teams.map((t) => (
                        <TableRow key={t.id} className="group">
                            <TableCell>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TableButton title="Edit">
                                        <HiOutlinePencil
                                            className="w-4 h-4"
                                            onClick={() =>
                                                redirect(`/staff/teams/${t.id}`)
                                            }
                                        />
                                    </TableButton>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/staff/teams/${t.id}`}
                                    className="hover:underline text-red-600 hover:text-red-800">
                                    {t.displayId}
                                </Link>
                            </TableCell>
                            <TableCell>{t.name}</TableCell>
                            <TableCell>{t.school}</TableCell>
                            <TableCell>{t.chaperone}</TableCell>
                            <TableCell>{t.division}</TableCell>
                            <TableCell>{t.size}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
