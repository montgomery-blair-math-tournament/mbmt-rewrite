import { ParticipantGrading, TeamGrading } from "./schema/grading";
import { Participant } from "./schema/participant";
import { Problem } from "./schema/problem";
import { Round } from "./schema/round";
import { Team } from "./schema/team";
import { User } from "./schema/user";
import { createClient } from "./supabase/server";

export async function fetchParticipants({
    id,
    teamId,
}: {
    id?: number | null;
    teamId?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from("participant").select("*");

    if (id !== null) {
        query = query.eq("id", id);
    }
    if (teamId !== null) {
        query = query.eq("team_id", teamId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as Participant[];
}

export async function fetchTeams({
    id,
    division,
}: {
    id?: number | null;
    division?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from("team").select("*");

    if (id) {
        query = query.eq("id", id);
    }

    if (division) {
        query = query.eq("division", division);
    }

    const { data, error } = await query;

    if (error) {
        console.log("aisjdgoijsadiogjioad");
        throw error;
    }

    return data as Team[];
}

export async function fetchRounds({
    id,
    division,
    type,
}: {
    id?: number | null;
    division?: number | null;
    type?: Round["type"];
}) {
    const supabase = await createClient();

    let query = supabase.from("round").select("*");

    if (id) {
        query = query.eq("id", id);
    }
    if (division) {
        query = query.eq("division", division);
    }
    if (type) {
        query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as Round[];
}

export async function fetchProblems({
    id,
    roundId,
}: {
    id?: number | null;
    roundId?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from("problem").select("*");

    if (id !== null) {
        query = query.eq("id", id);
    }

    if (roundId !== null) {
        query = query.eq("round_id", roundId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as Problem[];
}

export async function fetchUsers({ id }: { id?: string | null }) {
    const supabase = await createClient();

    let query = supabase.from("user").select("*");

    if (id !== null) {
        query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as User[];
}

export async function fetchParticipantGrades({
    id,
    problemId,
    roundId,
    participantId,
}: {
    id?: number | null;
    problemId?: number | null;
    roundId?: number | null;
    participantId?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from("participant_grading").select("*");

    if (id !== null) {
        query = query.eq("id", id);
    }
    if (problemId !== null) {
        query = query.eq("problem_id", problemId);
    }
    if (roundId !== null) {
        query = query.eq("round_id", roundId);
    }
    if (participantId !== null) {
        query = query.eq("participant_id", participantId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as ParticipantGrading[];
}

export async function fetchTeamGrades({
    id,
    problemId,
    roundId,
    teamId,
}: {
    id?: number | null;
    problemId?: number | null;
    roundId?: number | null;
    teamId?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from("team_grading").select("*");

    if (id !== null) {
        query = query.eq("id", id);
    }
    if (problemId !== null) {
        query = query.eq("problem_id", problemId);
    }
    if (roundId !== null) {
        query = query.eq("round_id", roundId);
    }
    if (teamId !== null) {
        query = query.eq("team_id", teamId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as TeamGrading[];
}
