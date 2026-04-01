"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePlayers, useActions } from "@/lib/hooks";
import PlayerAvatar from "./PlayerAvatar";

export default function SubmitAction() {
  const { players, loading: playersLoading } = usePlayers();
  const { actions, loading: actionsLoading } = useActions();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [...new Set(actions.map((a) => a.category))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !selectedAction) return;

    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert({
      player_id: selectedPlayer,
      action_id: selectedAction,
      note: note || null,
    });

    if (!error) {
      setSuccess(true);
      setSelectedAction("");
      setNote("");
      setTimeout(() => setSuccess(false), 2000);
    }
    setSubmitting(false);
  };

  if (playersLoading || actionsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-light font-body text-lg">
          Add some players first before submitting actions.
        </p>
      </div>
    );
  }

  const selectedActionData = actions.find((a) => a.id === selectedAction);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Player selection */}
      <div>
        <label className="section-label">Who did it?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => setSelectedPlayer(player.id)}
              className={`card-interactive flex items-center gap-2 px-3 py-3 text-left ${
                selectedPlayer === player.id
                  ? "ring-2 ring-gold bg-gold/10"
                  : ""
              }`}
            >
              <PlayerAvatar
                name={player.name}
                photoUrl={player.photo_url}
                emoji={player.avatar_emoji}
                size="sm"
              />
              <span className="font-display text-base truncate">
                {player.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action selection */}
      {selectedPlayer && (
        <div className="animate-fadeIn">
          <label className="section-label">What did they do?</label>
          {categories.map((category) => (
            <div key={category} className="mt-4">
              <h4 className="text-xs uppercase tracking-[0.15em] text-text-light font-body mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {actions
                  .filter((a) => a.category === category)
                  .map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => setSelectedAction(action.id)}
                      className={`card-interactive flex items-center gap-3 px-4 py-3 text-left ${
                        selectedAction === action.id
                          ? "ring-2 ring-gold bg-gold/10"
                          : ""
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">
                        {action.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-text truncate">
                          {action.name}
                        </p>
                      </div>
                      <span className="font-display text-lg text-gold flex-shrink-0">
                        +{action.points}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note + Submit */}
      {selectedAction && (
        <div className="animate-fadeIn space-y-4">
          <div>
            <label className="section-label">Add a note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any details or proof..."
              className="form-input mt-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting
              ? "Submitting..."
              : success
              ? "✓ Points Added!"
              : `Submit +${selectedActionData?.points || 0} pts`}
          </button>
        </div>
      )}

      {success && (
        <div className="text-center animate-fadeIn">
          <p className="text-olive font-display text-xl">Points recorded!</p>
        </div>
      )}
    </form>
  );
}
