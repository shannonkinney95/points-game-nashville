"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchSheetPlayers,
  fetchFlickrPhotos,
  findPhotoForName,
} from "@/lib/external-data";

export default function SyncPlayers({ onSync }: { onSync?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const [sheetPlayers, flickrPhotos] = await Promise.all([
        fetchSheetPlayers(),
        fetchFlickrPhotos(),
      ]);

      if (sheetPlayers.length === 0) {
        setResult("No players found in the RSVP sheet.");
        setSyncing(false);
        return;
      }

      // Get existing players to avoid duplicates
      const { data: existing } = await supabase
        .from("players")
        .select("name");
      const existingNames = new Set(
        (existing || []).map((p: { name: string }) =>
          p.name.toLowerCase().trim()
        )
      );

      let added = 0;
      let updated = 0;

      for (const sp of sheetPlayers) {
        const photoUrl = findPhotoForName(sp.name, flickrPhotos);
        const nameKey = sp.name.toLowerCase().trim();

        if (existingNames.has(nameKey)) {
          // Update photo if we found one and player already exists
          if (photoUrl) {
            await supabase
              .from("players")
              .update({ photo_url: photoUrl })
              .ilike("name", sp.name.trim());
            updated++;
          }
        } else {
          // Insert new player
          await supabase.from("players").insert({
            name: sp.name.trim(),
            avatar_emoji: "🤠",
            photo_url: photoUrl,
          });
          added++;
        }
      }

      setResult(
        `Synced! ${added} new player${added !== 1 ? "s" : ""} added${
          updated > 0
            ? `, ${updated} photo${updated !== 1 ? "s" : ""} updated`
            : ""
        }.`
      );
      onSync?.();
    } catch (err) {
      setResult(`Sync failed: ${err}`);
    }

    setSyncing(false);
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
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
          className="btn-primary flex-shrink-0"
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
