"use client";

import { useLeaderboard } from "@/lib/hooks";

const RANK_STYLES = [
  "text-3xl font-bold text-gold",
  "text-2xl font-semibold text-gold/80",
  "text-xl font-semibold text-gold/60",
];

export default function Leaderboard() {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-light font-body text-lg">
          No players yet — add some to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((entry, i) => (
        <div
          key={entry.player.id}
          className={`card flex items-center gap-4 transition-all hover:scale-[1.01] ${
            i === 0 ? "ring-2 ring-gold/40 bg-gold/5" : ""
          }`}
        >
          {/* Rank */}
          <div className="w-10 text-center">
            {i < 3 ? (
              <span className={RANK_STYLES[i]}>{i + 1}</span>
            ) : (
              <span className="text-lg text-text-light font-body">
                {i + 1}
              </span>
            )}
          </div>

          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center text-2xl flex-shrink-0">
            {entry.player.avatar_emoji}
          </div>

          {/* Name + count */}
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl text-text truncate">
              {entry.player.name}
            </p>
            <p className="text-sm text-text-light font-body">
              {entry.submission_count}{" "}
              {entry.submission_count === 1 ? "action" : "actions"}
            </p>
          </div>

          {/* Points */}
          <div className="text-right flex-shrink-0">
            <p className="font-display text-2xl text-gold">
              {entry.total_points}
            </p>
            <p className="text-xs text-text-light font-body uppercase tracking-wider">
              pts
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
