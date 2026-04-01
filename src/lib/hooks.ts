"use client";

import { useEffect, useState, useCallback } from "react";
import {
  supabase,
  Player,
  Action,
  SubmissionWithDetails,
  LeaderboardEntry,
} from "./supabase";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("name");
    if (data) setPlayers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("players")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => fetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { players, loading, refetch: fetch };
}

export function useActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("actions")
      .select("*")
      .order("category")
      .order("points", { ascending: false });
    if (data) setActions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("actions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "actions" },
        () => fetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { actions, loading, refetch: fetch };
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("submissions")
      .select("*, players(name, avatar_emoji), actions(name, points, emoji)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setSubmissions(data as unknown as SubmissionWithDetails[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => fetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { submissions, loading, refetch: fetch };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    // Fetch all players and submissions with action points
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
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => fetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => fetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { leaderboard, loading, refetch: fetch };
}
