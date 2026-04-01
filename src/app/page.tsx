"use client";

import { useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Leaderboard from "@/components/Leaderboard";
import SubmitAction from "@/components/SubmitAction";
import ActivityFeed from "@/components/ActivityFeed";
import ManagePlayers from "@/components/ManagePlayers";
import ManageActions from "@/components/ManageActions";

type Tab = "leaderboard" | "submit" | "feed" | "players" | "actions";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "leaderboard", label: "Leaderboard", emoji: "🏆" },
  { id: "submit", label: "Submit", emoji: "✨" },
  { id: "feed", label: "Feed", emoji: "📋" },
  { id: "players", label: "Players", emoji: "👯" },
  { id: "actions", label: "Actions", emoji: "🎯" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-bg-dark text-center py-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.15),transparent_70%)]" />
        <div className="relative z-10">
          <p className="text-gold/70 font-body text-xs uppercase tracking-[0.3em] mb-3">
            Nashville &middot; July 2026
          </p>
          <h1 className="font-accent text-5xl sm:text-6xl text-white mb-2">
            Points Game
          </h1>
          <p className="font-display text-xl text-white/60 italic">
            May the best girl win
          </p>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-body whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-gold text-gold"
                    : "border-transparent text-text-light hover:text-text-mid"
                }`}
              >
                <span className="text-base">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Section header */}
        <div className="mb-6">
          <p className="text-gold/60 font-body text-[11px] uppercase tracking-[0.2em]">
            {TABS.find((t) => t.id === activeTab)?.emoji}{" "}
            {TABS.find((t) => t.id === activeTab)?.label}
          </p>
          <h2 className="font-display text-3xl text-text mt-1">
            {activeTab === "leaderboard" && "Who\u2019s Winning"}
            {activeTab === "submit" && "Log an Action"}
            {activeTab === "feed" && "Recent Activity"}
            {activeTab === "players" && "The Girls"}
            {activeTab === "actions" && "Point Actions"}
          </h2>
        </div>

        <ErrorBoundary>
          {activeTab === "leaderboard" && <Leaderboard />}
          {activeTab === "submit" && <SubmitAction />}
          {activeTab === "feed" && <ActivityFeed />}
          {activeTab === "players" && <ManagePlayers />}
          {activeTab === "actions" && <ManageActions />}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-border">
        <p className="font-accent text-lg text-text-light">Points Game</p>
        <p className="text-xs text-text-light/60 font-body mt-1">
          Nashville &middot; July 2026
        </p>
      </footer>
    </div>
  );
}
