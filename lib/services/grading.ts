import {
    GradeSubmission,
    ParticipantGrading,
    TeamGrading,
} from "@/lib/schema/grading";

type GradeLike = {
    answer: string | null;
    is_correct: boolean | null;
    is_force?: boolean;
};

/**
 * Checks if two grades have a mismatch based on the problem type.
 */
export function checkMismatch(
    g1: GradeLike,
    g2: GradeLike,
    problemType: string
): boolean {
    const isStandard = problemType === "standard" || problemType === "boolean";
    if (isStandard) {
        return g1.is_correct !== g2.is_correct;
    } else {
        const a1 = (g1.answer || "").trim();
        const a2 = (g2.answer || "").trim();
        return a1 !== a2;
    }
}

/**
 * Computes the total score and overall grading status for a participant/team in a round.
 * This is a pure function that takes the raw fetched data.
 */
export function computeRoundScore(
    roundProblems: { id: number; points: number; type: string }[],
    allGrades: (ParticipantGrading | TeamGrading)[],
    isGuts: boolean
): { status: string; totalScore: number } {
    const gradesByProblem = new Map<
        number,
        (ParticipantGrading | TeamGrading)[]
    >();
    allGrades.forEach((g) => {
        if (!gradesByProblem.has(g.problem_id))
            gradesByProblem.set(g.problem_id, []);
        gradesByProblem.get(g.problem_id)?.push(g);
    });

    let totalScore = 0;
    let conflictCount = 0;
    let completedProblemsCount = 0;
    let gradedProblemsCount = 0;
    const totalProblems = roundProblems.length;

    for (const p of roundProblems) {
        const grades = gradesByProblem.get(p.id);

        const validGrades = grades
            ? grades.filter((g) => {
                  if (p.type === "standard" || p.type === "boolean") {
                      return g.is_correct !== null;
                  } else {
                      return g.answer && g.answer.trim() !== "";
                  }
              })
            : [];

        if (validGrades.length === 0) continue;
        gradedProblemsCount++;

        // Sort by LATEST
        validGrades.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

        const uniqueGrades = validGrades;
        const numGraders = uniqueGrades.length;

        let isConflict = false;
        let isConfirmed = false;
        let problemScore = 0;

        const threshold = isGuts ? 1 : 2;
        const hasForce = uniqueGrades.some((g) => g.is_force);

        if (!hasForce && numGraders > 1) {
            const first = uniqueGrades[0];
            const mismatch = uniqueGrades.some((g) => {
                return checkMismatch(g, first, p.type);
            });
            if (mismatch) isConflict = true;
        }

        if (isConflict) {
            problemScore = 0;
            conflictCount++;
        } else {
            if (numGraders >= threshold) {
                isConfirmed = true;
                completedProblemsCount++;
            }

            if (p.type === "standard" || p.type === "boolean") {
                if (uniqueGrades[0].is_correct) {
                    problemScore = p.points;
                }
            } else {
                problemScore = p.points;
            }
        }
        totalScore += problemScore;
    }

    let status = "NOT_STARTED";
    if (conflictCount > 0) {
        status = "CONFLICT";
    } else if (completedProblemsCount >= totalProblems && totalProblems > 0) {
        status = "COMPLETED";
    } else if (gradedProblemsCount > 0) {
        status = "IN_PROGRESS";
    }

    return { status, totalScore };
}

/**
 * Detects conflicts between new submissions and existing grades.
 * Returns an array of conflicts found.
 */
export function detectConflicts(
    submissions: GradeSubmission[],
    existingData: (ParticipantGrading | TeamGrading)[],
    problems: { id: number; type: string }[]
): {
    problemId: number;
    existingGrades: (ParticipantGrading | TeamGrading)[];
}[] {
    const typeMap = new Map(problems.map((p) => [p.id, p.type]));
    const existingMap = new Map<number, (ParticipantGrading | TeamGrading)[]>();
    existingData.forEach((row) => {
        if (!existingMap.has(row.problem_id))
            existingMap.set(row.problem_id, []);
        existingMap.get(row.problem_id)?.push(row);
    });

    const conflicts: {
        problemId: number;
        existingGrades: (ParticipantGrading | TeamGrading)[];
    }[] = [];

    for (const sub of submissions) {
        if (sub.isForce) continue;

        const existing = existingMap.get(sub.problemId);
        if (!existing || existing.length === 0) continue;

        const pType = typeMap.get(sub.problemId) || "standard";

        let isDifference = false;
        for (const e of existing) {
            const subGrade = {
                answer: sub.answer,
                is_correct: sub.isCorrect,
            };
            if (checkMismatch(subGrade, e, pType)) {
                isDifference = true;
                break;
            }
        }

        if (isDifference) {
            conflicts.push({
                problemId: sub.problemId,
                existingGrades: existing,
            });
        }
    }

    return conflicts;
}
