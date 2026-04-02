"use client";

import { useState } from "react";

export default function SyncPlayers({ onSync }: { onSync?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const resp = await fetch("/api/sync", { method: "POST" });
      const data = await resp.json();

      if (!resp.ok) {
        setResult(data.error || "Sync failed.");
      } else {
        setResult(data.message);
      }

      onSync?.();
    } catch (err) {
      setResult(`Sync failed: ${err}`);
    }

    setSyncing(false);
  };

  return (
    <div className="card space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h3 className="font-display text-xl text-text">
            Sync from RSVP Sheet
          </h3>
          <p className="text-xs text-text-light font-body mt-1">
            Pull names from the Google Form responses and match Flickr photos
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex-shrink-0 w-full sm:w-auto"
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>
      {result && (
        <p className="text-sm font-body text-olive animate-fadeIn">{result}</p>
      )}
    </div>
  );
}
