import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { HiOutlinePencil } from "react-icons/hi2";
import { TeamDisplay } from "@/lib/schema/team";

interface TeamsTableProps {
    teams: TeamDisplay[];
    loading: boolean;
}

export default function TeamsTable({ teams, loading }: TeamsTableProps) {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]"></TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Coach</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Size</TableHead>
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
                            <TableRow key={t.id} className="group hover:bg-gray-50">
                                <TableCell className="p-2">
                                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit">
                                        <HiOutlinePencil className="w-4 h-4" />
                                    </button>
                                </TableCell>
                                <TableCell>{t.displayId}</TableCell>
                                <TableCell>{t.name}</TableCell>
                                <TableCell>{t.school}</TableCell>
                                <TableCell>{t.coach}</TableCell>
                                <TableCell>{t.division}</TableCell>
                                <TableCell>{t.size}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
