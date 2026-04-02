import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  fetchSheetPlayers,
  fetchFlickrPhotos,
  findPhotoForName,
} from "@/lib/external-data";

// Server-side Supabase client (avoids relying on client-side env vars)
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST() {
  try {
    const supabase = getSupabase();

    // Both fetches run server-side — no CORS restrictions
    const [sheetPlayers, flickrPhotos] = await Promise.all([
      fetchSheetPlayers(),
      fetchFlickrPhotos(),
    ]);

    if (sheetPlayers.length === 0 && flickrPhotos.length === 0) {
      return NextResponse.json({
        added: 0,
        updated: 0,
        message: "No players found in the RSVP sheet or Flickr album.",
      });
    }

    const { data: existing } = await supabase.from("players").select("name");
    const existingNames = new Set(
      (existing || []).map((p: { name: string }) =>
        p.name.toLowerCase().trim()
      )
    );

    let added = 0;
    let updated = 0;

    // Sync sheet players (with Flickr photo matching)
    for (const sp of sheetPlayers) {
      const photoUrl = findPhotoForName(sp.name, flickrPhotos);
      const nameKey = sp.name.toLowerCase().trim();

      if (existingNames.has(nameKey)) {
        if (photoUrl) {
          await supabase
            .from("players")
            .update({ photo_url: photoUrl })
            .ilike("name", sp.name.trim());
          updated++;
        }
      } else {
        await supabase.from("players").insert({
          name: sp.name.trim(),
          avatar_emoji: "🤠",
          photo_url: photoUrl,
        });
        existingNames.add(nameKey);
        added++;
      }
    }

    // Reverse-sync: create players from Flickr photos not yet in the sheet or DB
    for (const photo of flickrPhotos) {
      const nameKey = photo.title.toLowerCase().trim();
      if (!nameKey) continue;
      if (existingNames.has(nameKey)) continue;

      await supabase.from("players").insert({
        name: photo.title.trim(),
        avatar_emoji: "🤠",
        photo_url: photo.url,
      });
      existingNames.add(nameKey);
      added++;
    }

    const parts: string[] = [];
    if (added > 0) parts.push(`${added} new player${added !== 1 ? "s" : ""} added`);
    if (updated > 0) parts.push(`${updated} photo${updated !== 1 ? "s" : ""} updated`);
    const message = parts.length > 0 ? `Synced! ${parts.join(", ")}.` : "Everything is up to date.";

    return NextResponse.json({ added, updated, flickrCount: flickrPhotos.length, message });
  } catch (err) {
    return NextResponse.json(
      { error: `Sync failed: ${err}` },
      { status: 500 }
    );
  }
}
