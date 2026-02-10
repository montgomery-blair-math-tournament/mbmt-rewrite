import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { HiOutlinePencil, HiCheck } from "react-icons/hi2";
import Link from "next/link";
import { ParticipantDisplay } from "@/lib/schema/participant";

interface ParticipantsTableProps {
    participants: ParticipantDisplay[];
    loading: boolean;
    readonly?: boolean;
}

export default function ParticipantsTable({
    participants,
    loading,
    readonly = false,
}: ParticipantsTableProps) {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        {/* Actions Column (Width w-20 approx) */}
                        {!readonly && (
                            <TableHead className="w-[80px]"></TableHead>
                        )}
                        <TableHead>Check In</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Chaperone</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={readonly ? 9 : 10}
                                className="text-center h-24">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : participants.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={readonly ? 9 : 10}
                                className="text-center h-24">
                                No participants found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        participants.map((p) => (
                            <TableRow
                                key={p.id}
                                className="group hover:bg-gray-50">
                                {!readonly && (
                                    <TableCell className="p-2">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/staff/participants/${p.id}`}
                                                className="p-1 hover:bg-gray-200 rounded text-gray-600 block"
                                                title="Edit">
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:cursor-pointer"
                                                title="Check In">
                                                <HiCheck className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell>
                                    {p.checkedIn ? "Yes" : "No"}
                                </TableCell>
                                <TableCell>
                                    {readonly ? (
                                        p.displayId
                                    ) : (
                                        <Link
                                            href={`/staff/participants/${p.id}`}
                                            className="hover:underline text-blue-600">
                                            {p.displayId}
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell>{p.firstName}</TableCell>
                                <TableCell>{p.lastName}</TableCell>
                                <TableCell>{p.division}</TableCell>
                                <TableCell>{p.grade}</TableCell>
                                <TableCell>{p.school}</TableCell>
                                <TableCell>{p.team}</TableCell>
                                <TableCell>{p.chaperone}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
