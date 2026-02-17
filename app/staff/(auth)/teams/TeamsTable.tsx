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
                    <TableHead>Players</TableHead>
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
                    teams.map((team) => (
                        <TableRow key={team.id} className="group">
                            <TableCell>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TableButton title="Edit">
                                        <HiOutlinePencil
                                            className="w-4 h-4"
                                            onClick={() =>
                                                redirect(
                                                    `/staff/teams/${team.id}`
                                                )
                                            }
                                        />
                                    </TableButton>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/staff/teams/${team.id}`}
                                    className="hover:underline text-rose-600 hover:text-rose-800">
                                    {team.displayId}
                                </Link>
                            </TableCell>
                            <TableCell>{team.name}</TableCell>
                            <TableCell>{team.school}</TableCell>
                            <TableCell>{team.chaperone}</TableCell>
                            <TableCell>{team.division}</TableCell>
                            <TableCell>{team.size}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
