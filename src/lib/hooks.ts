"use client";

import { useEffect, useState, useCallback } from "react";
import {
  supabase,
  Player,
  Action,
  SubmissionWithDetails,
  LeaderboardEntry,
} from "./supabase";

function trySubscribe(
  channelName: string,
  table: string | string[],
  onUpdate: () => void
) {
  try {
    let channel = supabase.channel(channelName);
    const tables = Array.isArray(table) ? table : [table];
    for (const t of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: t },
        () => onUpdate()
      );
    }
    channel.subscribe();
    return channel;
  } catch {
    // Realtime may not be available — data still works via polling
    return null;
  }
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("players")
        .select("*")
        .order("name");
      if (data) setPlayers(data);
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const channel = trySubscribe("players", "players", fetchData);
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { players, loading, refetch: fetchData };
}

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("actions")
        .select("*")
        .order("category")
        .order("points", { ascending: false });
      if (data) setActions(data);
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const channel = trySubscribe("actions", "actions", fetchData);
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { actions, loading, refetch: fetchData };
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("submissions")
        .select(
          "*, players(name, avatar_emoji, photo_url), actions(name, points, emoji)"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setSubmissions(data as unknown as SubmissionWithDetails[]);
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const channel = trySubscribe("submissions", "submissions", fetchData);
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { submissions, loading, refetch: fetchData };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [{ data: players }, { data: submissions }] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("submissions").select("*, actions(points)"),
      ]);

      if (players && submissions) {
        const entries: LeaderboardEntry[] = players.map((player: Player) => {
          const playerSubs = submissions.filter(
            (s: { player_id: string }) => s.player_id === player.id
          );
          const total_points = playerSubs.reduce(
            (sum: number, s: { actions: { points: number } }) =>
              sum + (s.actions?.points || 0),
            0
          );
          return {
            player,
            total_points,
            submission_count: playerSubs.length,
          };
        });

        entries.sort((a, b) => b.total_points - a.total_points);
        setLeaderboard(entries);
      }
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const channel = trySubscribe(
      "leaderboard",
      ["submissions", "players"],
      fetchData
    );
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { leaderboard, loading, refetch: fetchData };
}
