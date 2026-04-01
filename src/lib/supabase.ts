import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  name: string;
  avatar_emoji: string;
  photo_url: string | null;
  created_at: string;
};

export type Action = {
  id: string;
  name: string;
  points: number;
  emoji: string;
  category: string;
  created_at: string;
};

export type Submission = {
  id: string;
  player_id: string;
  action_id: string;
  note: string | null;
  created_at: string;
};

export type SubmissionWithDetails = Submission & {
  players: Pick<Player, "name" | "avatar_emoji" | "photo_url">;
  actions: Pick<Action, "name" | "points" | "emoji">;
};

export type LeaderboardEntry = {
  player: Player;
  total_points: number;
  submission_count: number;
};
