"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useActions } from "@/lib/hooks";

const CATEGORY_OPTIONS = [
  "Drinks",
  "Going Out",
  "Style",
  "House",
  "Bonus",
];

const EMOJI_OPTIONS = [
  "⭐", "🥃", "🍹", "🏆", "💅", "🎵", "🎤", "💃",
  "🎁", "📸", "🤠", "👗", "👯", "⏰", "🥞", "🎲",
  "🏊", "🌙", "🕺", "📱", "🔥", "💎", "🎉", "🍾",
];

export default function ManageActions() {
  const { actions, loading } = useActions();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(10);
  const [emoji, setEmoji] = useState("⭐");
  const [category, setCategory] = useState("General");
  const [adding, setAdding] = useState(false);

  const categories = [...new Set([...CATEGORY_OPTIONS, ...actions.map((a) => a.category)])];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    await supabase.from("actions").insert({
      name: name.trim(),
      points,
      emoji,
      category,
    });
    setName("");
    setPoints(10);
    setEmoji("⭐");
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this action? Related submissions will also be deleted."))
      return;
    await supabase.from("actions").delete().eq("id", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner" />
      </div>
    );
  }

  const groupedActions = categories
    .map((cat) => ({
      category: cat,
      items: actions.filter((a) => a.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Add action form */}
      <form onSubmit={handleAdd} className="card space-y-4">
        <h3 className="font-display text-xl text-text">Add an Action</h3>

        <div>
          <label className="section-label">Emoji</label>
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
          <label className="section-label">Action Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Get on stage at a bar"
            className="form-input mt-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label">Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              max={100}
              className="form-input mt-2"
              required
            />
          </div>
          <div>
            <label className="section-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input mt-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={adding || !name.trim()} className="btn-primary">
          {adding ? "Adding..." : "Add Action"}
        </button>
      </form>

      {/* Action list */}
      {groupedActions.map((group) => (
        <div key={group.category}>
          <h3 className="text-xs uppercase tracking-[0.15em] text-text-light font-body mb-2">
            {group.category}
          </h3>
          <div className="space-y-2">
            {group.items.map((action) => (
              <div
                key={action.id}
                className="card flex items-center gap-3 py-3"
              >
                <span className="text-xl">{action.emoji}</span>
                <span className="font-body text-sm text-text flex-1 truncate">
                  {action.name}
                </span>
                <span className="font-display text-lg text-gold">
                  +{action.points}
                </span>
                <button
                  onClick={() => handleRemove(action.id)}
                  className="text-sm text-text-light hover:text-red-500 transition-colors font-body ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
