import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Problem } from "@/lib/schema/problem";
import Math from "@/components/Math";
import { HiPencil, HiTrash } from "react-icons/hi2";

export default function ProblemCard({
    problem,
    onEdit,
    onDelete,
}: {
    problem: Problem;
    onEdit?: (problem: Problem) => void;
    onDelete?: (problem: Problem) => void;
}) {
    return (
        <Card className="dark:hover:bg-gray-800/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">
                    Problem {problem.number}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-300 dark:text-gray-500 capitalize px-2 py-1 bg-gray-800 dark:bg-gray-200 rounded-full">
                        {problem.type}
                    </div>
                    {onEdit && (
                        <button
                            onClick={() => onEdit(problem)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-rose-600 transition-colors hover:cursor-pointer"
                            aria-label="Edit problem">
                            <HiPencil className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(problem)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600 transition-colors hover:cursor-pointer"
                            aria-label="Delete problem">
                            <HiTrash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">
                            Problem
                        </div>
                        <div className="text-gray-900 dark:text-gray-300">
                            <Math eq={problem.problem} />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">
                            Answer
                        </div>
                        <div className="text-gray-900 dark:text-gray-300">
                            <Math eq={problem.answer} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
