import {
    BetterParticipantGrading,
    BetterTeamGrading,
    PARTICIPANT_GRADING_TABLE_NAME,
    TEAM_GRADING_TABLE_NAME,
} from "./schema2/grading";
import {
    BetterParticipant,
    PARTICIPANT_TABLE_NAME,
} from "./schema2/participant";
import { BetterRound, ROUND_TABLE_NAME } from "./schema2/round";
import { BetterTeam, TEAM_TABLE_NAME } from "./schema2/team";
import { BetterUser, USER_TABLE_NAME } from "./schema2/user";
import { createClient } from "./supabase/server";

export async function fetchParticipants({
    id,
    teamId,
}: {
    id?: number | null;
    teamId?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from(PARTICIPANT_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }
    if (teamId != null) {
        query = query.eq("team_id", teamId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterParticipant[];
}

export async function fetchTeams({ id }: { id?: number | null }) {
    const supabase = await createClient();

    let query = supabase.from(TEAM_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterTeam[];
}

export async function fetchRounds({ id }: { id?: number | null }) {
    const supabase = await createClient();

    let query = supabase.from(ROUND_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterRound[];
}

export async function fetchProblems({
    id,
    roundId,
}: {
    id?: number | null;
    roundId?: number | null;
}) {
    const supabase = await createClient();

    let query = supabase.from(USER_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }

    if (roundId != null) {
        query = query.eq("round_id", roundId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterRound[];
}

export async function fetchUsers({ id }: { id?: number | null }) {
    const supabase = await createClient();

    let query = supabase.from(USER_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterUser[];
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

    let query = supabase.from(PARTICIPANT_GRADING_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }
    if (problemId != null) {
        query = query.eq("problem_id", problemId);
    }
    if (roundId != null) {
        query = query.eq("round_id", roundId);
    }
    if (participantId != null) {
        query = query.eq("participant_id", participantId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterParticipantGrading[];
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

    let query = supabase.from(TEAM_GRADING_TABLE_NAME).select("*");

    if (id != null) {
        query = query.eq("id", id);
    }
    if (problemId != null) {
        query = query.eq("problem_id", problemId);
    }
    if (roundId != null) {
        query = query.eq("round_id", roundId);
    }
    if (teamId != null) {
        query = query.eq("team_id", teamId);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data as BetterTeamGrading[];
}
