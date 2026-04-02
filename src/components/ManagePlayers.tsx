"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePlayers } from "@/lib/hooks";
import PlayerAvatar from "./PlayerAvatar";
import SyncPlayers from "./SyncPlayers";

const EMOJI_OPTIONS = [
  "🤠", "👸", "💃", "🦋", "🌸", "🔥", "✨", "💅",
  "🎀", "🌙", "🦄", "🍹", "👑", "💎", "🌺", "🐝",
];

export default function ManagePlayers() {
  const { players, loading, refetch } = usePlayers();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤠");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    await supabase.from("players").insert({
      name: name.trim(),
      avatar_emoji: emoji,
    });
    setName("");
    setEmoji("🤠");
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this player? Their submissions will also be deleted."))
      return;
    await supabase.from("players").delete().eq("id", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync from RSVP sheet */}
      <SyncPlayers onSync={refetch} />

      {/* Add player form */}
      <form onSubmit={handleAdd} className="card space-y-4">
        <h3 className="font-display text-xl text-text">Add a Player</h3>

        <div>
          <label className="section-label">Choose an emoji</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                  emoji === e
                    ? "bg-gold/20 ring-2 ring-gold scale-110"
                    : "bg-warm hover:bg-gold/10"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="section-label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="form-input mt-2"
            required
          />
        </div>

        <button type="submit" disabled={adding || !name.trim()} className="btn-primary w-full sm:w-auto">
          {adding ? "Adding..." : "Add Player"}
        </button>
      </form>

      {/* Player list */}
      {players.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-text mb-3">
            Current Players
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="card flex items-center gap-3 py-3"
              >
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photo_url}
                  emoji={player.avatar_emoji}
                />
                <span className="font-display text-lg text-text flex-1">
                  {player.name}
                </span>
                <button
                  onClick={() => handleRemove(player.id)}
                  className="text-sm text-text-light hover:text-red-500 transition-colors font-body"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
