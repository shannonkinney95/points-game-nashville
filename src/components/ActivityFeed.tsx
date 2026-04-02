"use client";

import { useSubmissions } from "@/lib/hooks";
import PlayerAvatar from "./PlayerAvatar";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed() {
  const { submissions, loading } = useSubmissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-light font-body text-lg">
          No activity yet — submit some actions to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="card flex items-start sm:items-center gap-2.5 sm:gap-3 py-3 animate-fadeIn"
        >
          <div className="mt-0.5 sm:mt-0">
            <PlayerAvatar
              name={sub.players?.name || ""}
              photoUrl={sub.players?.photo_url || null}
              emoji={sub.players?.avatar_emoji || "👤"}
              size="sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs sm:text-sm text-text leading-relaxed">
              <span className="font-semibold">{sub.players?.name}</span>{" "}
              <span className="text-text-mid">earned</span>{" "}
              <span className="text-gold font-semibold">
                +{sub.actions?.points}
              </span>{" "}
              <span className="text-text-mid">for</span>{" "}
              <span>
                {sub.actions?.emoji} {sub.actions?.name}
              </span>
            </p>
            {sub.note && (
              <p className="text-[11px] sm:text-xs text-text-light mt-0.5 italic">
                &ldquo;{sub.note}&rdquo;
              </p>
            )}
          </div>
          <span className="text-[10px] sm:text-xs text-text-light flex-shrink-0 font-body mt-0.5 sm:mt-0">
            {timeAgo(sub.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
