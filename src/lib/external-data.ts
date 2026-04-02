const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1WbChy0qZD6sQmIip-aoP7RwtClz8Zs2Ft4PX27z2KMA/gviz/tq?tqx=out:csv";

const FLICKR_USER_ID = "194580811@N08";
const FLICKR_SET_ID = "72177720332858718";

export type SheetPlayer = {
  name: string;
  instagram: string;
  city: string;
  connection: string;
};

export type FlickrPhoto = {
  title: string;
  url: string;
};

function parseCSV(text: string): SheetPlayer[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());
    return cols;
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase());

  const findLast = (keyword: string) => {
    let idx = -1;
    headers.forEach((h, i) => {
      if (h.includes(keyword)) idx = i;
    });
    return idx;
  };

  const nameIdx = findLast("name");
  const instagramIdx = findLast("instagram");
  const cityIdx = findLast("where");
  const connectionIdx = findLast("connection");

  return lines
    .slice(1)
    .map((line) => {
      const cols = parseRow(line);
      return {
        name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
        instagram: instagramIdx >= 0 ? cols[instagramIdx] || "" : "",
        city: cityIdx >= 0 ? cols[cityIdx] || "" : "",
        connection: connectionIdx >= 0 ? cols[connectionIdx] || "" : "",
      };
    })
    .filter((r) => r.name);
}

export async function fetchSheetPlayers(): Promise<SheetPlayer[]> {
  try {
    const resp = await fetch(SHEET_CSV_URL);
    if (!resp.ok) return [];
    const text = await resp.text();
    return parseCSV(text);
  } catch {
    return [];
  }
}

export async function fetchFlickrPhotos(): Promise<FlickrPhoto[]> {
  // Try album feed first (more reliable), fall back to public feed
  const urls = [
    `https://api.flickr.com/services/feeds/photoset.gne?set=${FLICKR_SET_ID}&nsid=${FLICKR_USER_ID}&format=json&nojsoncallback=1`,
    `https://api.flickr.com/services/feeds/photos_public.gne?id=${FLICKR_USER_ID}&format=json&nojsoncallback=1`,
  ];

  for (const url of urls) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();
      if (!data || !data.items || data.items.length === 0) continue;
      return data.items.map(
        (item: { title: string; media: { m: string } }) => ({
          title: item.title,
          // Swap _m (240px) for _w (400px) for better quality
          url: item.media.m.replace("_m.jpg", "_w.jpg"),
        })
      );
    } catch {
      continue;
    }
  }
  return [];
}

/**
 * Fuzzy-match a player name from the sheet to a Flickr photo title.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findPhotoForName(
  sheetName: string,
  photos: FlickrPhoto[]
): string | null {
  const norm = normalizeName(sheetName);
  const normParts = norm.split(" ");

  for (const photo of photos) {
    const pNorm = normalizeName(photo.title);

    // Exact match
    if (norm === pNorm) return photo.url;

    // One starts with the other
    if (norm.startsWith(pNorm) || pNorm.startsWith(norm)) return photo.url;

    // First + last name fuzzy match
    const pParts = pNorm.split(" ");
    if (normParts.length >= 2 && pParts.length >= 2) {
      const firstMatch =
        normParts[0].startsWith(pParts[0]) ||
        pParts[0].startsWith(normParts[0]);
      const lastMatch =
        normParts[normParts.length - 1] === pParts[pParts.length - 1];
      if (firstMatch && lastMatch) return photo.url;
    }

    // Single-token photo title matches first name
    if (pParts.length === 1 && normParts[0].startsWith(pParts[0]))
      return photo.url;
  }

  return null;
}
